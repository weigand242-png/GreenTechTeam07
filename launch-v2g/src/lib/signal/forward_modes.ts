import type { SignalMode } from "@/lib/signal/current_hour";
import { classifyMode, priceThresholds } from "@/lib/signal/current_hour";
import type { HourlyPoint } from "@/lib/timeseries";

/**
 * The charge/hold/discharge suggestion for a single hour, ready to plot as a
 * stepped line over the price chart.
 */
export interface HourMode {
  /** Hour-start epoch ms — matches the chart's time x-axis. */
  tsMs: number;
  mode: SignalMode;
  /** True when the hour's price came from forecast (not published) data. */
  isForecast: boolean;
}

/**
 * Project the quantile charge/hold/discharge signal across every hour in the
 * window that has a usable price. Thresholds are taken once over the *whole*
 * window via `priceThresholds`, so the suggestion at the current hour matches
 * what `currentHourSignal` reports for the live banner. The current-hour marker
 * is drawn separately by the chart's now-line, so no `now` is needed here.
 */
export function forwardModes(points: HourlyPoint[]): HourMode[] {
  const thresholds = priceThresholds(points);
  if (thresholds === null) return [];

  return points
    .filter((p) => typeof p.priceEurPerMwh === "number")
    .map((p) => ({
      tsMs: new Date(p.timestamp).getTime(),
      mode: classifyMode(p.priceEurPerMwh as number, thresholds),
      isForecast: p.source === "forecast",
    }))
    .sort((a, b) => a.tsMs - b.tsMs);
}
