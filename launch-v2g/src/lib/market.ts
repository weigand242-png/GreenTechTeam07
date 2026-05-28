import "server-only";
import fs from "node:fs";
import path from "node:path";

export type Season = "spring" | "summer" | "autumn" | "winter";

export interface DailyPricePoint {
  date: string;
  meanEurPerMwh: number;
}

export interface SeasonWeekPoint {
  hourOfWeek: number;
  weekday: string;
  hour: number;
  priceEurPerMwh: number;
}

const MARKET_DIR = path.resolve(process.cwd(), "..", "market2025");

const SEASON_FILES: Record<Season, string> = {
  spring: "average_fruehling_week.csv",
  summer: "average_sommer_week.csv",
  autumn: "average_herbst_week.csv",
  winter: "average_winter_week.csv",
};

let yearlyCache: DailyPricePoint[] | null = null;
let seasonsCache: Record<Season, SeasonWeekPoint[]> | null = null;

function parseGermanDate(value: string): string {
  // "DD.MM.YYYY HH:MM" -> "YYYY-MM-DD"
  const [day, month, yearAndTime] = value.split(".");
  const year = yearAndTime.slice(0, 4);
  return `${year}-${month}-${day}`;
}

export function getYearlyDailyMeanPrices(): DailyPricePoint[] {
  if (yearlyCache) return yearlyCache;

  const csvPath = path.join(
    MARKET_DIR,
    "usable_Grosshandelspreise_2025_Deutschland_je_Stunde.csv",
  );
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split("\n").filter((l) => l.length > 0);
  const [, ...rows] = lines;

  const sums = new Map<string, { total: number; count: number }>();
  for (const line of rows) {
    const cols = line.split(";");
    const datum = cols[0];
    const price = Number(cols[1]);
    if (!datum || Number.isNaN(price)) continue;
    const date = parseGermanDate(datum);
    const entry = sums.get(date) ?? { total: 0, count: 0 };
    entry.total += price;
    entry.count += 1;
    sums.set(date, entry);
  }

  yearlyCache = Array.from(sums.entries())
    .map(([date, { total, count }]) => ({
      date,
      meanEurPerMwh: total / count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return yearlyCache;
}

function parseSeasonFile(season: Season): SeasonWeekPoint[] {
  const csvPath = path.join(MARKET_DIR, SEASON_FILES[season]);
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split("\n").filter((l) => l.length > 0);
  const [, ...rows] = lines;

  return rows
    .map((line) => {
      const cols = line.split(",");
      const weekdayIdx = Number(cols[0]);
      const weekday = cols[1];
      const hour = Number(cols[2]);
      const price = Number(cols[3]);
      return {
        hourOfWeek: weekdayIdx * 24 + hour,
        weekday,
        hour,
        priceEurPerMwh: price,
      };
    })
    .sort((a, b) => a.hourOfWeek - b.hourOfWeek);
}

export function getSeasonAveragedWeeks(): Record<Season, SeasonWeekPoint[]> {
  if (seasonsCache) return seasonsCache;
  seasonsCache = {
    spring: parseSeasonFile("spring"),
    summer: parseSeasonFile("summer"),
    autumn: parseSeasonFile("autumn"),
    winter: parseSeasonFile("winter"),
  };
  return seasonsCache;
}
