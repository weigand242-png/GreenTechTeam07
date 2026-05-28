import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedCounter from "@/components/shared/atoms/AnimatedCounter";
import { Zap } from "lucide-react";

interface Props {
  capacityKwh: number;
  revenueEur: number;
  className?: string;
}

export default function PotentialV2GCard({
  capacityKwh,
  revenueEur,
  className,
}: Props) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="text-v2g-discharge size-5" />
          Potential V2G capacity
        </CardTitle>
        <CardDescription>
          If the fleet discharged 30% of its charged energy back during evening
          peaks.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pb-4">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Energy back to grid
          </p>
          <div className="flex items-baseline gap-2">
            <AnimatedCounter
              className="text-4xl font-semibold md:text-5xl"
              end={capacityKwh}
              duration={2.5}
              separator="."
              decimals={0}
            />
            <span className="text-muted-foreground text-lg">kWh</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Revenue potential @ 0.18 €/kWh
          </p>
          <div className="flex items-baseline gap-2">
            <AnimatedCounter
              className="text-v2g-discharge text-3xl font-semibold"
              end={revenueEur}
              duration={2.5}
              separator="."
              decimals={0}
              prefix="€ "
            />
            <Badge variant="secondary">projected</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
