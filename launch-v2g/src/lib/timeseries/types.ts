export type HourlySource = "published" | "forecast";

export interface HourlyPoint {
  timestamp: string;
  priceEurPerMwh: number | null;
  loadMw: number | null;
  solarWPerM2: number | null;
  source: HourlySource;
}

export interface TimeseriesWindow {
  points: HourlyPoint[];
  generatedAt: string;
  providerId: string;
}
