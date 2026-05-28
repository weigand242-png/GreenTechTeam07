import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LiveClock from "@/components/shared/atoms/LiveClock";
import type { CurrentHourSignal, SignalMode } from "@/lib/signal/current_hour";
import { cn } from "@/lib/utils";
import { Activity, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

interface GridIntensityCardProps {
  signal: CurrentHourSignal;
  className?: string;
}

function priceTone(price: number): "green" | "amber" | "red" {
  if (price > 0.3) return "red";
  if (price > 0.18) return "amber";
  return "green";
}

export default function GridIntensityCard({
  signal,
  className,
}: GridIntensityCardProps) {
  const { priceEurPerKwh: price, nextPriceEurPerKwh: nextPrice, mode } = signal;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Activity className="size-5" />
            Grid signal — right now
          </span>
          <LiveClock className="text-muted-foreground text-sm font-medium tabular-nums" />
        </CardTitle>
        <CardDescription>
          {signal.isFallback
            ? "Showing demo data — no live grid signal available."
            : "Live wholesale price. Tells the fleet whether to charge, hold, or feed back."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <Gauge
            label="Price now"
            value={price.toFixed(3)}
            unit="€/kWh"
            tone={priceTone(price)}
          />
          <Gauge
            label="Next hour"
            value={nextPrice === null ? "—" : nextPrice.toFixed(3)}
            unit={nextPrice === null ? "not yet published" : "€/kWh"}
            tone={nextPrice === null ? "neutral" : priceTone(nextPrice)}
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
  tone: "green" | "amber" | "red" | "neutral";
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
          tone === "neutral" && "text-muted-foreground",
        )}
      >
        {value}
      </p>
      <p className="text-muted-foreground text-xs">{unit}</p>
    </div>
  );
}

function ModeBanner({ mode }: { mode: SignalMode }) {
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
