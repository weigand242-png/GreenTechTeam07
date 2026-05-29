import "server-only";

export class SmardFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SmardFetchError";
  }
}

export interface SmardPoint {
  timestamp: string;
  value: number | null;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface SmardIndex {
  timestamps: number[];
}

interface SmardSeries {
  series: Array<[number, number | null]>;
}

function baseUrl(): string {
  return process.env.SMARD_BASE_URL ?? "https://www.smard.de/app/chart_data";
}

async function fetchSeriesForWindow(
  filterId: number,
  region: string,
  resolution: "hour" | "quarterhour",
  windowStart: Date,
  windowEnd: Date,
): Promise<SmardPoint[]> {
  const base = baseUrl();
  const indexUrl = `${base}/${filterId}/${region}/index_${resolution}.json`;

  const indexRes = await fetch(indexUrl, { next: { revalidate: 3600 } });
  if (!indexRes.ok) {
    throw new SmardFetchError(
      `SMARD index ${filterId}/${region} returned ${indexRes.status}`,
    );
  }
  const index = (await indexRes.json()) as SmardIndex;
  if (!index.timestamps?.length) {
    throw new SmardFetchError(`SMARD index ${filterId}/${region} empty`);
  }

  const startMs = windowStart.getTime();
  const endMs = windowEnd.getTime();
  const overlapping = index.timestamps.filter(
    (ts) => ts + WEEK_MS > startMs && ts < endMs,
  );
  const filesToFetch =
    overlapping.length > 0 ? overlapping : index.timestamps.slice(-1);

  const points: SmardPoint[] = [];
  for (const ts of filesToFetch) {
    const dataUrl = `${base}/${filterId}/${region}/${filterId}_${region}_${resolution}_${ts}.json`;
    const dataRes = await fetch(dataUrl, { next: { revalidate: 3600 } });
    if (!dataRes.ok) {
      throw new SmardFetchError(
        `SMARD data ${filterId}/${region}/${ts} returned ${dataRes.status}`,
      );
    }
    const payload = (await dataRes.json()) as SmardSeries;
    for (const [ms, value] of payload.series) {
      if (ms >= startMs && ms <= endMs) {
        points.push({ timestamp: new Date(ms).toISOString(), value });
      }
    }
  }
  return points;
}

export async function fetchDayAheadPrices(
  windowStart: Date,
  windowEnd: Date,
): Promise<SmardPoint[]> {
  return fetchSeriesForWindow(4169, "DE-LU", "hour", windowStart, windowEnd);
}
