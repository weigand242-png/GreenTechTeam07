import type { TimeseriesWindow } from "../types";

export interface TimeseriesProvider {
  readonly id: string;
  getWindow(): Promise<TimeseriesWindow>;
}
