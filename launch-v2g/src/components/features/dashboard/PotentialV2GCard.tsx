"use client";

import { useFleetSize } from "@/components/features/fleet/useFleetSize";
import AnimatedCounter from "@/components/shared/atoms/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { fmtCount, fmtPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { useState } from "react";

interface Props {
  /** Average nameplate battery capacity per vehicle, in kWh. */
  averageBatteryKwh: number;
  /** Live wholesale price from the grid signal, in €/kWh. */
  priceEurPerKwh: number;
  /** Average expected price across the next 24h, in €/kWh (null if no forecast). */
  forecastAvgEurPerKwh: number | null;
  /** Best-case (peak) expected price across the next 24h, in €/kWh. */
  forecastPeakEurPerKwh: number | null;
  /** ISO timestamp of the hour at which the next-24h peak price occurs. */
  forecastPeakHourIso: string | null;
  /** True if the next-24h window draws on forecast (not published) hours. */
  forecastHasForecastData: boolean;
  className?: string;
}

const DEFAULT_SELL_PCT = 30;

type PriceBasis = "now" | "forecast";

/** Local-time hour label, e.g. "20:00" — matches LiveClock / chart axis convention. */
function fmtHour(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PotentialV2GCard({
  averageBatteryKwh,
  priceEurPerKwh,
  forecastAvgEurPerKwh,
  forecastPeakEurPerKwh,
  forecastPeakHourIso,
  forecastHasForecastData,
  className,
}: Props) {
  const [sellPct, setSellPct] = useState(DEFAULT_SELL_PCT);
  const [basis, setBasis] = useState<PriceBasis>("now");
  const { fleetSize } = useFleetSize();

  const hasForecast = forecastAvgEurPerKwh !== null;
  // Fall back to "now" whenever the forecast window has no usable data.
  const activeBasis: PriceBasis = hasForecast ? basis : "now";

  const activePrice =
    activeBasis === "forecast" && forecastAvgEurPerKwh !== null
      ? forecastAvgEurPerKwh
      : priceEurPerKwh;

  // Fleet storage capacity scales with the projected fleet size set on /fleet.
  const capacityKwh = fleetSize * averageBatteryKwh;
  const capacityMwh = capacityKwh / 1000;
  const soldKwh = capacityKwh * (sellPct / 100);
  const revenueEur = soldKwh * activePrice;
  const peakRevenueEur =
    forecastPeakEurPerKwh !== null ? soldKwh * forecastPeakEurPerKwh : null;
  const showForecast = activeBasis === "forecast";

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="text-v2g-discharge size-5" />
          Potential V2G capacity
        </CardTitle>
        <CardDescription>
          Total fleet storage, valued at the live grid price. Drag the slider to
          choose how much to feed back to the grid.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pb-4">
        <BasisToggle
          basis={activeBasis}
          onChange={setBasis}
          forecastEnabled={hasForecast}
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Fleet storage capacity
            </p>
            <div className="flex items-baseline gap-2">
              <AnimatedCounter
                className="text-4xl font-semibold md:text-5xl"
                end={capacityMwh}
                duration={2.5}
                separator="."
                decimals={1}
              />
              <span className="text-muted-foreground text-lg">MWh</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              {showForecast ? "Avg. 24h price" : "Live grid price"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tabular-nums md:text-5xl">
                {fmtPrice(activePrice)}
              </span>
              <span className="text-muted-foreground text-lg">€/kWh</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Sold back to grid
            </p>
            <span className="text-sm font-semibold tabular-nums">
              {sellPct}% · {fmtCount(Math.round(soldKwh))} kWh
            </span>
          </div>
          <Slider
            value={sellPct}
            onValueChange={(v) => setSellPct(Array.isArray(v) ? v[0] : v)}
            min={0}
            max={100}
            step={1}
            aria-label="Share of stored energy sold back to the grid"
          />
        </div>

        <div
          className={cn(
            "grid gap-4",
            showForecast && peakRevenueEur !== null && "grid-cols-2",
          )}
        >
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              {showForecast ? "Revenue at avg." : "Revenue at"}{" "}
              {fmtPrice(activePrice)} €/kWh
            </p>
            <div className="flex items-baseline gap-2">
              <AnimatedCounter
                className="text-grid-amber text-3xl font-semibold"
                end={revenueEur}
                duration={0.4}
                separator="."
                decimals={0}
                prefix="€ "
              />
              <Badge variant="secondary">
                {showForecast && forecastHasForecastData ? "forecast" : "projected"}
              </Badge>
            </div>
          </div>
          {showForecast && peakRevenueEur !== null && (
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Best-case at peak {fmtPrice(forecastPeakEurPerKwh as number)} €/kWh
              </p>
              <AnimatedCounter
                className="text-v2g-discharge text-3xl font-semibold"
                end={peakRevenueEur}
                duration={0.4}
                separator="."
                decimals={0}
                prefix="€ "
              />
              {forecastPeakHourIso && (
                <p className="text-muted-foreground text-xs">
                  expected around ~{fmtHour(forecastPeakHourIso)}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BasisToggle({
  basis,
  onChange,
  forecastEnabled,
}: {
  basis: PriceBasis;
  onChange: (basis: PriceBasis) => void;
  forecastEnabled: boolean;
}) {
  const options: { value: PriceBasis; label: string; disabled?: boolean }[] = [
    { value: "now", label: "Live now" },
    { value: "forecast", label: "24h forecast", disabled: !forecastEnabled },
  ];
  return (
    <div
      role="group"
      aria-label="Price basis"
      className="bg-muted inline-flex w-fit rounded-lg p-0.5"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          aria-pressed={basis === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            basis === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
            opt.disabled && "cursor-not-allowed opacity-50 hover:text-muted-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
