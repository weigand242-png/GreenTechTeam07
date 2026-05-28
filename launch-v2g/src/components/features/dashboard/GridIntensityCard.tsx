"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useEffect, useState } from "react";

type Mode = "discharge" | "hold" | "charge";

interface GridState {
  carbonGramsPerKwh: number;
  priceEurPerKwh: number;
  mode: Mode;
}

const INITIAL_STATE: GridState = {
  carbonGramsPerKwh: 280,
  priceEurPerKwh: 0.22,
  mode: "hold",
};

function classify(carbon: number, price: number): Mode {
  if (price >= 0.3 && carbon >= 350) return "discharge";
  if (price <= 0.12 && carbon <= 180) return "charge";
  return "hold";
}

function sampleGrid(seed: number): GridState {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const peak = Math.sin(((hour - 6) / 24) * Math.PI * 2);
  const carbon = Math.round(280 + peak * 120 + (seed % 30) - 15);
  const price = Number(
    (0.22 + peak * 0.12 + ((seed * 13) % 40 - 20) / 1000).toFixed(3),
  );
  return {
    carbonGramsPerKwh: Math.max(80, carbon),
    priceEurPerKwh: Math.max(0.05, price),
    mode: classify(carbon, price),
  };
}

export default function GridIntensityCard({ className }: { className?: string }) {
  const [state, setState] = useState<GridState>(INITIAL_STATE);

  useEffect(() => {
    let seed = 0;
    const update = () => setState(sampleGrid(seed++));
    update();
    const id = setInterval(update, 4000);
    return () => clearInterval(id);
  }, []);

  const { carbonGramsPerKwh: carbon, priceEurPerKwh: price, mode } = state;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5" />
          Grid signal — right now
        </CardTitle>
        <CardDescription>
          Live carbon intensity and wholesale price. Tells the fleet whether to
          charge, hold, or feed back.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <Gauge
            label="Carbon"
            value={`${carbon}`}
            unit="gCO₂/kWh"
            tone={carbon > 350 ? "red" : carbon > 250 ? "amber" : "green"}
          />
          <Gauge
            label="Price"
            value={price.toFixed(3)}
            unit="€/kWh"
            tone={price > 0.30 ? "red" : price > 0.18 ? "amber" : "green"}
          />
        </div>
        <ModeBanner mode={mode} />
      </CardContent>
    </Card>
  );
}

function Gauge({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone: "green" | "amber" | "red";
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "green" && "text-grid-green",
          tone === "amber" && "text-grid-amber",
          tone === "red" && "text-grid-red",
        )}
      >
        {value}
      </p>
      <p className="text-muted-foreground text-xs">{unit}</p>
    </div>
  );
}

function ModeBanner({ mode }: { mode: Mode }) {
  const meta = {
    discharge: {
      icon: ArrowUpFromLine,
      label: "Feed back to grid",
      detail: "High price + dirty grid — V2G fleet earns and decarbonises.",
      cls: "border-grid-green/40 bg-grid-green/10 text-grid-green",
    },
    hold: {
      icon: Activity,
      label: "Hold",
      detail: "Mixed signal — vehicles idle or trickle-charge.",
      cls: "border-grid-amber/40 bg-grid-amber/10 text-grid-amber",
    },
    charge: {
      icon: ArrowDownToLine,
      label: "Charge from grid",
      detail: "Cheap, low-carbon energy — top up batteries now.",
      cls: "border-grid-red/40 bg-grid-red/10 text-grid-red",
    },
  }[mode];
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-3 py-2.5",
        meta.cls,
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col">
        <p className="text-sm font-semibold">{meta.label}</p>
        <p className="text-foreground/80 text-xs">{meta.detail}</p>
      </div>
    </div>
  );
}
