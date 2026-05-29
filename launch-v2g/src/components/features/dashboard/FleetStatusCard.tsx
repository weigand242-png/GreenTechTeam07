import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fmtCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Car } from "lucide-react";
import type { VehicleSegment } from "@/lib/sessions";

interface Props {
  totalVehicles: number;
  totalSessions: number;
  averageBatteryKwh: number;
  vehiclesBySegment: Record<VehicleSegment, number>;
  className?: string;
}

const SEGMENT_LABEL: Record<VehicleSegment, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

export default function FleetStatusCard({
  totalVehicles,
  totalSessions,
  averageBatteryKwh,
  vehiclesBySegment,
  className,
}: Props) {
  const segments = (Object.keys(vehiclesBySegment) as VehicleSegment[]).map(
    (seg) => ({
      seg,
      count: vehiclesBySegment[seg],
      pct: vehiclesBySegment[seg] / Math.max(totalVehicles, 1),
    }),
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="text-v2g-charge size-5" />
          Fleet overview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Vehicles" value={fmtCount(totalVehicles)} />
          <Stat label="Sessions" value={fmtCount(totalSessions)} />
          <Stat
            label="Avg. battery"
            value={`${averageBatteryKwh.toFixed(0)} kWh`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Vehicle segments
          </p>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            {segments.map(({ seg, pct }) => (
              <div
                key={seg}
                className={cn(
                  seg === "small" && "bg-chart-1",
                  seg === "medium" && "bg-chart-2",
                  seg === "large" && "bg-chart-3",
                )}
                style={{ width: `${pct * 100}%` }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {segments.map(({ seg, count, pct }) => (
              <div key={seg} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    seg === "small" && "bg-chart-1",
                    seg === "medium" && "bg-chart-2",
                    seg === "large" && "bg-chart-3",
                  )}
                />
                <span className="text-muted-foreground">
                  {SEGMENT_LABEL[seg]}
                </span>
                <span className="font-medium">
                  {count} ({(pct * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
