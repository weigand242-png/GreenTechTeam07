import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { TimeseriesWindow } from "../types";
import type { TimeseriesProvider } from "./types";

const PROVIDER_ID = "static-json";
const SAMPLE_PATH = path.join(process.cwd(), "src/data/timeseries_sample.json");

let cached: TimeseriesWindow | null = null;

function load(): TimeseriesWindow {
  if (cached) return cached;
  const raw = fs.readFileSync(SAMPLE_PATH, "utf8");
  const parsed = JSON.parse(raw) as Omit<TimeseriesWindow, "providerId">;
  cached = { ...parsed, providerId: PROVIDER_ID };
  return cached;
}

export const staticJsonProvider: TimeseriesProvider = {
  id: PROVIDER_ID,
  async getWindow() {
    return load();
  },
};
