import type { HourlyPoint } from "@/lib/timeseries";
import { HOUR_MS, hourKey } from "@/lib/time";

/**
 * Forward-looking price aggregates over the provider window, in €/kWh.
 * All values are future-only (strictly after the current hour) and gap-tolerant
 * (hours without a published/forecast price are skipped). A window with no usable
 * hours yields `null` rather than NaN.
 */
export interface ForwardWindows {
  next3hAvgEurPerKwh: number | null;
  next6hAvgEurPerKwh: number | null;
  next24hAvgEurPerKwh: number | null;
  /** Best-case discharge price across the next-24h future hours. */
  next24hPeakEurPerKwh: number | null;
  /** ISO timestamp of the hour at which the next-24h peak occurs. */
  next24hPeakHourIso: string | null;
  /** True if any future hour used carries `source: "forecast"`. */
  next24hHasForecast: boolean;
}

interface FuturePoint {
  timestamp: string;
  priceMwh: number;
  isForecast: boolean;
}

const toKwh = (eurPerMwh: number) => Number((eurPerMwh / 1000).toFixed(3));

function avgKwh(points: FuturePoint[]): number | null {
  if (points.length === 0) return null;
  const sum = points.reduce((acc, p) => acc + p.priceMwh, 0);
  return toKwh(sum / points.length);
}

export function forwardWindows(
  points: HourlyPoint[],
  now: Date,
): ForwardWindows {
  const nowHourMs = Math.floor(now.getTime() / HOUR_MS) * HOUR_MS;

  // Future-only hours (strictly after the current hour) with a usable price,
  // ordered by time so the first N entries are the next N hours.
  const future: FuturePoint[] = points
    .filter(
      (p) =>
        hourKey(p.timestamp) > nowHourMs && typeof p.priceEurPerMwh === "number",
    )
    .sort((a, b) => hourKey(a.timestamp) - hourKey(b.timestamp))
    .map((p) => ({
      timestamp: p.timestamp,
      priceMwh: p.priceEurPerMwh as number,
      isForecast: p.source === "forecast",
    }));

  const next24 = future.slice(0, 24);

  // Earliest hour wins on ties (strict `>` keeps the first-seen max).
  const peak =
    next24.length === 0
      ? null
      : next24.reduce((best, p) => (p.priceMwh > best.priceMwh ? p : best));

  return {
    next3hAvgEurPerKwh: avgKwh(future.slice(0, 3)),
    next6hAvgEurPerKwh: avgKwh(future.slice(0, 6)),
    next24hAvgEurPerKwh: avgKwh(next24),
    next24hPeakEurPerKwh: peak === null ? null : toKwh(peak.priceMwh),
    next24hPeakHourIso: peak === null ? null : peak.timestamp,
    next24hHasForecast: next24.some((p) => p.isForecast),
  };
}
