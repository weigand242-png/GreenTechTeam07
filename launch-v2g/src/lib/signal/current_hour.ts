import type { HourlyPoint } from "@/lib/timeseries";

export type SignalMode = "charge" | "hold" | "discharge";

export interface CurrentHourSignal {
  mode: SignalMode;
  priceEurPerKwh: number;
  carbonProxyGramsPerKwh: number;
  isFallback: boolean;
}

const FALLBACK: CurrentHourSignal = {
  mode: "hold",
  priceEurPerKwh: 0.22,
  carbonProxyGramsPerKwh: 280,
  isFallback: true,
};

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function currentHourSignal(
  points: HourlyPoint[],
  now: Date,
): CurrentHourSignal {
  const prices = points
    .map((p) => p.priceEurPerMwh)
    .filter((v): v is number => typeof v === "number")
    .sort((a, b) => a - b);
  if (prices.length === 0) return FALLBACK;

  const nowHourMs = Math.floor(now.getTime() / 3_600_000) * 3_600_000;
  const current =
    points.find((p) => {
      const ms = Date.parse(p.timestamp);
      return Math.floor(ms / 3_600_000) * 3_600_000 === nowHourMs;
    }) ?? points[0];
  const priceMwh = current.priceEurPerMwh ?? prices[Math.floor(prices.length / 2)];

  const p25 = quantile(prices, 0.25);
  const p75 = quantile(prices, 0.75);
  const mode: SignalMode =
    priceMwh <= p25 ? "charge" : priceMwh >= p75 ? "discharge" : "hold";

  // Transparent proxy: high price + low solar ⇒ dirtier grid. Not a real
  // carbon-intensity feed (Electricity Maps is the follow-up). Anchored so a
  // €60/MWh, zero-solar hour lands near ~300 g/kWh.
  const solar = current.solarWPerM2 ?? 0;
  const priceComponent = Math.max(0, Math.min(1, priceMwh / 120));
  const solarComponent = Math.max(0, Math.min(1, solar / 800));
  const carbonProxy =
    120 + Math.round(priceComponent * 280 - solarComponent * 100);

  return {
    mode,
    priceEurPerKwh: Number((priceMwh / 1000).toFixed(3)),
    carbonProxyGramsPerKwh: Math.max(60, Math.min(520, carbonProxy)),
    isFallback: false,
  };
}
