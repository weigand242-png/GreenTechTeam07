import { staticJsonProvider } from "./providers/static_json";
import type { TimeseriesProvider } from "./providers/types";

export type { HourlyPoint, HourlySource, TimeseriesWindow } from "./types";
export type { TimeseriesProvider } from "./providers/types";

export function getActiveProvider(): TimeseriesProvider {
  return staticJsonProvider;
}
