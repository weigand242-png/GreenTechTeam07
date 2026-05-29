export const HOUR_MS = 3_600_000;

/** Floor an ISO timestamp to the start of its hour, as epoch ms. */
export function hourKey(iso: string): number {
  return Math.floor(Date.parse(iso) / HOUR_MS) * HOUR_MS;
}
