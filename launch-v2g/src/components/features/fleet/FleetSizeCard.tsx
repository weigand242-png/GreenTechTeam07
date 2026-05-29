"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  MAX_FLEET_SIZE,
  MIN_FLEET_SIZE,
  useFleetSize,
} from "@/components/features/fleet/useFleetSize";
import { fmtCount, fmtMwh } from "@/lib/format";
import { Sliders } from "lucide-react";

interface Props {
  /** Average nameplate battery capacity per vehicle, in kWh. */
  averageBatteryKwh: number;
  className?: string;
}

export default function FleetSizeCard({ averageBatteryKwh, className }: Props) {
  const { fleetSize, setFleetSize } = useFleetSize();

  const capacityKwh = fleetSize * averageBatteryKwh;
  const capacityMwh = capacityKwh / 1000;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="text-v2g-charge size-5" />
          Projected fleet size
        </CardTitle>
        <CardDescription>
          Scale the enrolled fleet to model the V2G storage potential. Drives the
          fleet storage capacity shown on the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-4xl font-semibold tabular-nums md:text-5xl">
            {fmtCount(fleetSize)}
          </span>
          <span className="text-muted-foreground text-lg">vehicles</span>
        </div>

        <Slider
          value={fleetSize}
          onValueChange={(v) => setFleetSize(Array.isArray(v) ? v[0] : v)}
          min={MIN_FLEET_SIZE}
          max={MAX_FLEET_SIZE}
          step={50}
          aria-label="Projected number of vehicles enrolled in the V2G programme"
        />
        <div className="text-muted-foreground flex justify-between text-xs tabular-nums">
          <span>{fmtCount(MIN_FLEET_SIZE)}</span>
          <span>{fmtCount(MAX_FLEET_SIZE)}</span>
        </div>

        <div className="flex flex-col gap-1 border-t pt-4">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Fleet storage capacity
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-v2g-charge text-3xl font-semibold tabular-nums">
              {fmtMwh(capacityMwh)}
            </span>
            <span className="text-muted-foreground text-lg">MWh</span>
          </div>
          <p className="text-muted-foreground text-xs">
            {fmtCount(fleetSize)} vehicles ×{" "}
            {averageBatteryKwh.toFixed(0)} kWh avg. battery
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
