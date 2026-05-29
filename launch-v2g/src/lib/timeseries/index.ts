import { liveProvider } from "./providers/live";
import { staticJsonProvider } from "./providers/static_json";
import type { TimeseriesProvider } from "./providers/types";

export type { HourlyPoint, HourlySource, TimeseriesWindow } from "./types";
export type { TimeseriesProvider } from "./providers/types";

export function getActiveProvider(): TimeseriesProvider {
  return process.env.LIVE_TIMESERIES === "1" ? liveProvider : staticJsonProvider;
}
