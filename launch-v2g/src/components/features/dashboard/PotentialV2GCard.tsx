"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import AnimatedCounter from "@/components/shared/atoms/AnimatedCounter";
import { Zap } from "lucide-react";

interface Props {
  /** Total nameplate battery capacity of the fleet, in kWh. */
  capacityKwh: number;
  /** Live wholesale price from the grid signal, in €/kWh. */
  priceEurPerKwh: number;
  className?: string;
}

const DEFAULT_SELL_PCT = 30;

export default function PotentialV2GCard({
  capacityKwh,
  priceEurPerKwh,
  className,
}: Props) {
  const [sellPct, setSellPct] = useState(DEFAULT_SELL_PCT);

  const capacityMwh = capacityKwh / 1000;
  const soldKwh = capacityKwh * (sellPct / 100);
  const revenueEur = soldKwh * priceEurPerKwh;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="text-v2g-discharge size-5" />
          Potential V2G capacity
        </CardTitle>
        <CardDescription>
          Total fleet storage, valued at the live grid price. Drag the slider to
          choose how much is fed back to the grid.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pb-4">
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
              Live grid price
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tabular-nums md:text-5xl">
                {priceEurPerKwh.toFixed(3)}
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
              {sellPct}% · {Math.round(soldKwh).toLocaleString("de-DE")} kWh
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

        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Revenue at {priceEurPerKwh.toFixed(3)} €/kWh
          </p>
          <div className="flex items-baseline gap-2">
            <AnimatedCounter
              className="text-v2g-discharge text-3xl font-semibold"
              end={revenueEur}
              duration={0.4}
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
