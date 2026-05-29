import "server-only";

import { fetchSolarRadiation } from "@/lib/open_meteo_client";
import { fetchDayAheadPrices, type SmardPoint } from "@/lib/smard_client";
import type { HourlyPoint, HourlySource, TimeseriesWindow } from "../types";
import type { TimeseriesProvider } from "./types";
import { staticJsonProvider } from "./static_json";
import { HOUR_MS, hourKey } from "@/lib/time";

const PROVIDER_ID = "live";
const FALLBACK_PROVIDER_ID = "live-fallback";

const WINDOW_PAST_HOURS = 3;
const WINDOW_FUTURE_HOURS = 24;

function indexByHour(points: SmardPoint[]): Map<number, number | null> {
  const out = new Map<number, number | null>();
  for (const p of points) out.set(hourKey(p.timestamp), p.value);
  return out;
}

async function buildLiveWindow(): Promise<TimeseriesWindow> {
  const now = new Date();
  const startMs =
    Math.floor(now.getTime() / HOUR_MS) * HOUR_MS -
    WINDOW_PAST_HOURS * HOUR_MS;
  const endMs = startMs + (WINDOW_PAST_HOURS + WINDOW_FUTURE_HOURS) * HOUR_MS;
  const windowStart = new Date(startMs);
  const windowEnd = new Date(endMs);

  const lat = Number(process.env.FLEET_LAT ?? "52.52");
  const lon = Number(process.env.FLEET_LON ?? "13.41");

  const [prices, solar] = await Promise.all([
    fetchDayAheadPrices(windowStart, windowEnd),
    fetchSolarRadiation(lat, lon, windowStart, windowEnd),
  ]);

  const priceByHour = indexByHour(prices);
  const solarByHour = new Map<number, number | null>();
  for (const s of solar) solarByHour.set(hourKey(s.timestamp), s.shortwaveRadiationWPerM2);

  const points: HourlyPoint[] = [];
  for (let ms = startMs; ms < endMs; ms += HOUR_MS) {
    const price = priceByHour.get(ms) ?? null;
    // SMARD publishes day-ahead prices the afternoon before. Hours past that
    // horizon get marked "forecast" so the chart can flag them later.
    const source: HourlySource = priceByHour.has(ms) ? "published" : "forecast";
    points.push({
      timestamp: new Date(ms).toISOString(),
      priceEurPerMwh: price,
      // Grid load dropped from the chart: no free SMARD series provides a forward
      // (future-hour) load forecast, so this is always null in the live window.
      loadMw: null,
      solarWPerM2: solarByHour.get(ms) ?? null,
      source,
    });
  }

  return {
    points,
    generatedAt: new Date().toISOString(),
    providerId: PROVIDER_ID,
  };
}

export const liveProvider: TimeseriesProvider = {
  id: PROVIDER_ID,
  async getWindow(): Promise<TimeseriesWindow> {
    try {
      return await buildLiveWindow();
    } catch (err) {
      console.warn("[live timeseries] falling back to static sample:", err);
      const fallback = await staticJsonProvider.getWindow();
      return { ...fallback, providerId: FALLBACK_PROVIDER_ID };
    }
  },
};
