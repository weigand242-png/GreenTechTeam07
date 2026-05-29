import type { HourlyPoint } from "@/lib/timeseries";
import { HOUR_MS, hourKey } from "@/lib/time";

export type SignalMode = "charge" | "hold" | "discharge";

export interface CurrentHourSignal {
  mode: SignalMode;
  priceEurPerKwh: number;
  nextPriceEurPerKwh: number | null;
  isFallback: boolean;
}

const FALLBACK: CurrentHourSignal = {
  mode: "hold",
  priceEurPerKwh: 0.22,
  nextPriceEurPerKwh: null,
  isFallback: true,
};

export interface PriceThresholds {
  p25: number;
  p75: number;
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/**
 * 25th/75th percentile of the window's prices (€/MWh). Returns `null` when no
 * hour carries a usable price. Shared by `currentHourSignal` and the forward
 * per-hour classifier so both read the same thresholds off the same price set.
 */
export function priceThresholds(points: HourlyPoint[]): PriceThresholds | null {
  const prices = points
    .map((p) => p.priceEurPerMwh)
    .filter((v): v is number => typeof v === "number")
    .sort((a, b) => a - b);
  if (prices.length === 0) return null;
  return { p25: quantile(prices, 0.25), p75: quantile(prices, 0.75) };
}

/** Quantile decision rule: cheap → charge, expensive → discharge, else hold. */
export function classifyMode(priceMwh: number, t: PriceThresholds): SignalMode {
  return priceMwh <= t.p25 ? "charge" : priceMwh >= t.p75 ? "discharge" : "hold";
}

export function currentHourSignal(
  points: HourlyPoint[],
  now: Date,
): CurrentHourSignal {
  const thresholds = priceThresholds(points);
  if (thresholds === null) return FALLBACK;

  const nowHourMs = Math.floor(now.getTime() / HOUR_MS) * HOUR_MS;
  const current =
    points.find((p) => hourKey(p.timestamp) === nowHourMs) ?? points[0];
  const next = points.find((p) => hourKey(p.timestamp) === nowHourMs + HOUR_MS);

  const priceMwh = current.priceEurPerMwh ?? (thresholds.p25 + thresholds.p75) / 2;
  const nextPriceMwh = next?.priceEurPerMwh ?? null;

  const mode: SignalMode = classifyMode(priceMwh, thresholds);

  return {
    mode,
    priceEurPerKwh: Number((priceMwh / 1000).toFixed(3)),
    nextPriceEurPerKwh:
      nextPriceMwh === null ? null : Number((nextPriceMwh / 1000).toFixed(3)),
    isFallback: false,
  };
}
