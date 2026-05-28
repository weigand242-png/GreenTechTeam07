import "server-only";

export class OpenMeteoFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenMeteoFetchError";
  }
}

export interface SolarPoint {
  timestamp: string;
  shortwaveRadiationWPerM2: number | null;
}

interface OpenMeteoResponse {
  hourly?: {
    time: string[];
    shortwave_radiation: Array<number | null>;
  };
}

export async function fetchSolarRadiation(
  lat: number,
  lon: number,
  windowStart: Date,
  windowEnd: Date,
): Promise<SolarPoint[]> {
  const base =
    process.env.OPEN_METEO_BASE_URL ?? "https://api.open-meteo.com/v1/forecast";
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: "shortwave_radiation",
    timezone: "UTC",
    past_days: "1",
    forecast_days: "2",
  });

  const res = await fetch(`${base}?${params.toString()}`, {
    next: { revalidate: 900 },
  });
  if (!res.ok) {
    throw new OpenMeteoFetchError(
      `Open-Meteo forecast returned ${res.status}`,
    );
  }
  const payload = (await res.json()) as OpenMeteoResponse;
  if (!payload.hourly?.time?.length) {
    throw new OpenMeteoFetchError("Open-Meteo response missing hourly data");
  }

  const startMs = windowStart.getTime();
  const endMs = windowEnd.getTime();
  const points: SolarPoint[] = [];
  payload.hourly.time.forEach((iso, i) => {
    const ms = Date.parse(`${iso}Z`);
    if (Number.isNaN(ms) || ms < startMs || ms > endMs) return;
    points.push({
      timestamp: new Date(ms).toISOString(),
      shortwaveRadiationWPerM2: payload.hourly!.shortwave_radiation[i] ?? null,
    });
  });
  return points;
}
