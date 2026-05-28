import "server-only";
import fs from "node:fs";
import path from "node:path";

export type LocationType = "workplace" | "highway" | "urban" | "depot" | "home";
export type VehicleSegment = "small" | "medium" | "large";

export interface Session {
  sessionId: string;
  vehicleId: string;
  start: Date;
  end: Date;
  locationType: LocationType;
  postalCode: string;
  kWhDelivered: number;
  peakKw: number;
  segment: VehicleSegment;
  batteryCapacityKwh: number;
  socStartPct: number;
  socEndPct: number;
}

export interface FleetSnapshot {
  totalVehicles: number;
  totalSessions: number;
  totalKwhDelivered: number;
  averageSessionKwh: number;
  averagePeakKw: number;
  averageBatteryKwh: number;
  vehiclesBySegment: Record<VehicleSegment, number>;
  sessionsByLocation: Record<LocationType, number>;
  potentialV2GCapacityKwh: number;
  potentialV2GRevenueEur: number;
  recentSessions: Session[];
}

const POTENTIAL_DISCHARGE_FRACTION = 0.3;
const V2G_TARIFF_EUR_PER_KWH = 0.18;

let cached: FleetSnapshot | null = null;

function parseCsv(): Session[] {
  const csvPath = path.join(process.cwd(), "src/data/ev_sessions.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split("\n").filter((l) => l.length > 0);
  const [, ...rows] = lines;

  return rows.map((line) => {
    const cols = line.split(",");
    return {
      sessionId: cols[0],
      vehicleId: cols[1],
      start: new Date(cols[2]),
      end: new Date(cols[3]),
      locationType: cols[4] as LocationType,
      postalCode: cols[5],
      kWhDelivered: Number(cols[6]),
      peakKw: Number(cols[7]),
      segment: cols[8] as VehicleSegment,
      batteryCapacityKwh: Number(cols[9]),
      socStartPct: Number(cols[10]),
      socEndPct: Number(cols[11]),
    };
  });
}

function increment<K extends string>(acc: Record<K, number>, key: K) {
  acc[key] = (acc[key] ?? 0) + 1;
}

export function getFleetSnapshot(): FleetSnapshot {
  if (cached) return cached;

  const sessions = parseCsv();

  const vehiclesBySegment = { small: 0, medium: 0, large: 0 } as Record<
    VehicleSegment,
    number
  >;
  const sessionsByLocation = {
    workplace: 0,
    highway: 0,
    urban: 0,
    depot: 0,
    home: 0,
  } as Record<LocationType, number>;

  const vehicleSegments = new Map<string, VehicleSegment>();
  const vehicleBatteries = new Map<string, number>();

  let totalKwh = 0;
  let totalPeak = 0;

  for (const s of sessions) {
    totalKwh += s.kWhDelivered;
    totalPeak += s.peakKw;
    increment(sessionsByLocation, s.locationType);
    if (!vehicleSegments.has(s.vehicleId)) {
      vehicleSegments.set(s.vehicleId, s.segment);
      vehicleBatteries.set(s.vehicleId, s.batteryCapacityKwh);
    }
  }

  for (const seg of vehicleSegments.values()) {
    increment(vehiclesBySegment, seg);
  }

  const totalVehicles = vehicleSegments.size;
  const averageBatteryKwh =
    Array.from(vehicleBatteries.values()).reduce((a, b) => a + b, 0) /
    Math.max(totalVehicles, 1);

  const potentialV2GCapacityKwh = totalKwh * POTENTIAL_DISCHARGE_FRACTION;
  const potentialV2GRevenueEur = potentialV2GCapacityKwh * V2G_TARIFF_EUR_PER_KWH;

  const recentSessions = [...sessions]
    .sort((a, b) => b.start.getTime() - a.start.getTime())
    .slice(0, 8);

  cached = {
    totalVehicles,
    totalSessions: sessions.length,
    totalKwhDelivered: totalKwh,
    averageSessionKwh: totalKwh / Math.max(sessions.length, 1),
    averagePeakKw: totalPeak / Math.max(sessions.length, 1),
    averageBatteryKwh,
    vehiclesBySegment,
    sessionsByLocation,
    potentialV2GCapacityKwh,
    potentialV2GRevenueEur,
    recentSessions,
  };
  return cached;
}
