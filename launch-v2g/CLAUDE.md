@AGENTS.md

# launch-v2g

Next.js app for the **Plug & Earn** V2G hackathon prototype. Stack basics, commands, and
the Next.js 16 docs rule live in the repo-root `CLAUDE.md` and `AGENTS.md`.

## Current state

Sidebar-navigated dashboard with a CSV-driven fleet snapshot, live grid data, and
Chart.js charts. The **Dashboard** (`/`) shows the live charge/hold/discharge signal, the
price/load/weather overlay chart, and the V2G-potential calculator. **Fleet** (`/fleet`)
shows the fleet snapshot, recent sessions, and the fleet-size control; **Grid** (`/grid`)
shows the yearly and seasonal price charts. **Settings** (`/settings`) is still a
placeholder.

Live data comes from SMARD (prices, grid load) and Open-Meteo (solar) via
`lib/timeseries/`, which falls back to `data/timeseries_sample.json` when a fetch fails.
Still unbuilt: the pure `lib/recommendation_engine.ts`, any `/api` routes, the per-hour
decision band on the chart, and the `regelleistung` balancing-market reference. The
current `lib/signal/current_hour.ts` is a simple quantile-threshold signal, not the full
degradation-gated engine described below.

## Layout

```
src/
  app/
    layout.tsx            # root: fonts + globals
    (app)/
      layout.tsx          # sidebar + main column
      page.tsx            # dashboard
      fleet/  grid/       # populated routes
      settings/           # placeholder
  components/
    ui/                   # shadcn primitives (do not hand-edit; regenerate via shadcn CLI)
    features/<domain>/    # page-specific composed components (e.g. dashboard/*Card.tsx, *Chart.tsx)
    shared/{atoms,organisms}/  # cross-page building blocks (Sidebar, SidebarButton, ...)
  lib/
    sessions.ts           # server-only CSV parser + cached FleetSnapshot
    market.ts             # server-only German market-price CSV loaders (cached)
    smard_client.ts open_meteo_client.ts   # server-only live-data fetchers
    timeseries/           # provider abstraction: live (SMARD+Open-Meteo) + static fallback
    signal/current_hour.ts  # quantile-based charge/hold/discharge signal
    time.ts               # HOUR_MS + hourKey (shared hour-bucketing)
    format.ts             # de-DE number formatters (fmtCount/fmtMwh/fmtPrice/fmtEnergy1)
    fonts.ts utils.ts     # cn() = clsx + tailwind-merge
  data/                   # ev_sessions.csv (demo fleet) + timeseries_sample.json (fallback)
  types/navigation.ts     # sidebarLinks registry
```

## Conventions for this app

- shadcn config in `components.json` (style `base-nova`, base color `neutral`, icons
  `lucide`). Add new primitives with `npx shadcn@latest add <name>` — don't write them
  by hand. UI primitives go in `src/components/ui/`; composed/business components go in
  `features/<domain>/` or `shared/`.
- Component filenames are **PascalCase** (`FleetStatusCard.tsx`, `SidebarButton.tsx`) —
  this overrides the global lowercase-snake default. `lib/` and `types/` files stay
  lowercase.
- Data access lives in `src/lib/*.ts` with `import "server-only"`. The current pattern
  is: parse CSV once, cache in module scope, expose a typed snapshot to server
  components. No fetch / no `/api` routes yet — add them under `src/app/api/` when a
  live source (SMARD, Open-Meteo, ...) lands.
- Primitives also come from `@base-ui/react` (unstyled) — prefer it over installing
  another headless lib.
- Path alias `@/*` → `src/*`. Public assets via `@/public/*`.
- Adding a sidebar entry = append to `sidebarLinks` in `src/types/navigation.ts` and
  create the matching route under `src/app/(app)/<slug>/page.tsx`.

## Product direction

Target is a 24h charge/hold/discharge recommendation overlaid on German grid + price +
weather data, with an honest gross-vs-net-of-degradation earnings readout. **Built:** the
SMARD/Open-Meteo clients, the `lib/timeseries/` provider abstraction, and the multi-axis
Chart.js overlay. **Still to build:** `lib/recommendation_engine.ts` (pure), the
`app/api/{prices,grid,weather,recommendation}` routes, the per-hour decision band on the
chart, and a committed `data/regelleistung_snapshot.json` for the balancing-market
reference. See the team's notes / `assets/` for the full spec; treat anything not on disk
as unbuilt.

---

## The chart

A single Chart.js **multi-axis line chart** (type `line`). **Do NOT use a stacked chart**
for the overlay — stacking sums series vertically, which is meaningless across €/MWh,
MW, and W/m². (A true stacked area is only correct for a separate generation-mix view,
which is out of scope here.)

- Shared X axis: hourly time, "now − a few h" through "now + 24h".
- Multiple Y axes:
  - `yPrice` (left): day-ahead price €/MWh — the visually dominant line.
  - `yLoad` (right): grid load MW.
  - `yWeather` (right, hidden or secondary): solar radiation W/m².
- The **charge / hold / discharge decision is drawn as a colored background band** behind
  the lines (green = charge/buy, grey = hold, amber/red = discharge/sell), one segment
  per hour. Implement with a small Chart.js plugin that paints `chartArea` rectangles per
  hour based on the recommendation array, or with per-hour annotation boxes. Hours whose
  price came from the weather proxy (not published day-ahead) get a hatched/lighter band.
- A time cursor / tooltip shows, for the hovered hour: price, state, and the one-line
  reason ("discharge: price €X/MWh, spread clears degradation floor").

---

## The algorithm (recommendation engine)

This is the core IP and the thing judges will stress-test. Keep it a **pure function** in
`lib/recommendation_engine.ts` so it's trivially testable.

### States

For each of the next 24 hours, output exactly one of:
- `CHARGE` — buy energy / charge the fleet (cheap hour).
- `HOLD` — do nothing.
- `DISCHARGE` — sell energy / discharge to grid (expensive hour) **only if it clears the
  degradation gate**.

### Why the degradation gate is non-negotiable

Per the challenge brief: a discharge that earns less than the wear it causes is not
viable (NREL/EPRI: daily V2G roughly doubles the calendar+cycle fade vs EV-only). A naive
"buy low / sell high" rule will happily recommend trades that lose money once wear is
counted. The gate is what makes this defensible.

### Constants (tunable, put in one config block with sourced comments)

```ts
const RTE = 0.90;                       // round-trip efficiency (charge*discharge), ~0.9
const PACK_COST_EUR_PER_KWH = 120;      // 2025-26 pack-level cost, conservative
const CYCLE_LIFE = 4000;                // equivalent full cycles to ~80% SoH (NMC/LFP mix)
const USABLE_DOD = 0.8;                 // usable depth of discharge
// Marginal battery-wear cost per MWh of energy cycled through the pack:
//   = pack_cost_per_kWh / (cycle_life * usable_DoD)  [€/kWh]  * 1000 [kWh/MWh]
//   = 120 / (4000 * 0.8) * 1000  ≈  €37.5 / MWh
const DEGRADATION_COST_EUR_PER_MWH = 38;
```

Expose these in the UI (or at least a config) so the team can defend / sensitivity-test
them on stage. Show how the recommendation changes as the degradation cost moves.

### Decision logic (per 24h window of hourly prices `p[]` in €/MWh)

```
1. Build the window: published day-ahead prices where available; for unpublished tail
   hours, fill p[h] with a weather-proxy estimate (see proxy note) and flag them.

2. Thresholds from the window distribution:
     p_low  = 25th percentile of p[]
     p_high = 75th percentile of p[]

3. Effective cost basis to store 1 MWh now and sell later:
     charge_basis = mean(p where p <= p_low) / RTE      // pay more in than you get out

4. For each hour h, respecting a simulated SoC (soc_min..soc_max, start mid):
     if p[h] <= p_low and soc < soc_max:
         state = CHARGE        ; soc += step
     elif p[h] >= p_high:
         net = p[h] * RTE - charge_basis - DEGRADATION_COST_EUR_PER_MWH
         if net > 0 and soc > soc_min:
             state = DISCHARGE ; soc -= step
         else:
             state = HOLD      // expensive, but spread doesn't beat the wear cost
     else:
         state = HOLD
```

Greedy + a simple SoC walk is fine for the prototype. The **expected, honest result is
that many hours are HOLD** — typical German day-ahead peak-to-trough spread
(~€30–80/MWh, occasionally more / negative midday) often does *not* clear a ~€38/MWh wear
floor after round-trip losses. That is a feature, not a bug: surface it. "On a flat day
the marketplace correctly tells the fleet to do nothing" is a stronger judging story than
a tool that always says trade.

### Weather price-proxy (for unpublished tail hours only)

Rough, transparent proxy — not a trained model: higher forecast solar+wind generation
(SMARD `5097` / Open-Meteo `shortwave_radiation`) → lower expected price; high forecast
load → higher. A simple monotonic mapping calibrated against the last few days of
(forecast generation, realized price) is enough. Label these hours "forecast" in the UI
and never let a proxy hour trigger DISCHARGE on its own without a wider safety margin.

### Earnings readout

Over the 24h window, compute and display **both**:
- Gross arbitrage: `Σ(discharge_MWh * price) − Σ(charge_MWh * price)`
- **Net of degradation:** gross − `Σ(discharge_MWh * DEGRADATION_COST_EUR_PER_MWH)`

Showing the two side by side makes the degradation impact legible and pre-empts the
obvious judge question. Scale by a fleet-size input (number of vehicles × per-vehicle
dischargeable kWh). Add a line noting the 1 MW minimum balancing lot — a single fleet
likely contributes a fraction of one lot, which is the hook for the aggregator/pooling
story (context only; not implemented here).

### Optional grounding from the supply CSV

If time allows, derive an **hourly availability profile** (fraction of fleet parked with
usable SoC, by hour-of-day) from `NML_ev_sessions.csv` and use it to scale available
MW/MWh per hour, so discharge can only be recommended when the fleet is actually plugged
in. MVP fallback: a constant fleet-availability parameter. The CSV is synthetic — treat
as illustrative.
