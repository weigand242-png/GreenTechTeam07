// Shared number formatting (German locale). Client-safe — no "server-only".

/** Integer with thousands separators, e.g. 1.250. */
export const fmtCount = (n: number) => n.toLocaleString("de-DE");

/** One-decimal MWh value, e.g. 12,5. */
export const fmtMwh = (n: number) =>
  n.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

/** Price in €/kWh, three decimals, e.g. 0.184. */
export const fmtPrice = (eurPerKwh: number) => eurPerKwh.toFixed(3);

/** Energy in kWh, one decimal, e.g. 42.3. */
export const fmtEnergy1 = (kwh: number) => kwh.toFixed(1);
