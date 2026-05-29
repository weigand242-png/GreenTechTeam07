import type { HourlyPoint } from "@/lib/timeseries";

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

const HOUR_MS = 3_600_000;

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function hourKey(iso: string): number {
  return Math.floor(Date.parse(iso) / HOUR_MS) * HOUR_MS;
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

  const nowHourMs = Math.floor(now.getTime() / HOUR_MS) * HOUR_MS;
  const current =
    points.find((p) => hourKey(p.timestamp) === nowHourMs) ?? points[0];
  const next = points.find((p) => hourKey(p.timestamp) === nowHourMs + HOUR_MS);

  const priceMwh = current.priceEurPerMwh ?? prices[Math.floor(prices.length / 2)];
  const nextPriceMwh = next?.priceEurPerMwh ?? null;

  const p25 = quantile(prices, 0.25);
  const p75 = quantile(prices, 0.75);
  const mode: SignalMode =
    priceMwh <= p25 ? "charge" : priceMwh >= p75 ? "discharge" : "hold";

  return {
    mode,
    priceEurPerKwh: Number((priceMwh / 1000).toFixed(3)),
    nextPriceEurPerKwh:
      nextPriceMwh === null ? null : Number((nextPriceMwh / 1000).toFixed(3)),
    isFallback: false,
  };
}
