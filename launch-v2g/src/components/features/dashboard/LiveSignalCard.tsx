import LiveClock from "@/components/shared/atoms/LiveClock";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fmtPrice } from "@/lib/format";
import type { CurrentHourSignal, SignalMode } from "@/lib/signal/current_hour";
import type { ForwardWindows } from "@/lib/signal/forward_windows";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  MoveRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface LiveSignalCardProps {
  signal: CurrentHourSignal;
  windows: ForwardWindows;
  className?: string;
}

// €0.005/kWh = €5/MWh — below this the next-hour move isn't a meaningful trend.
const TREND_EPSILON_EUR_PER_KWH = 0.005;

type Tone = "green" | "amber" | "red" | "neutral";

function priceTone(price: number): "green" | "amber" | "red" {
  if (price > 0.3) return "red";
  if (price > 0.18) return "amber";
  return "green";
}

function toneClass(tone: Tone): string {
  return cn(
    tone === "green" && "text-grid-green",
    tone === "amber" && "text-grid-amber",
    tone === "red" && "text-grid-red",
    tone === "neutral" && "text-muted-foreground",
  );
}

type TrendDirection = "up" | "down" | "flat";

function trendDirection(
  current: number,
  next: number | null,
): TrendDirection | null {
  if (next === null) return null;
  const delta = next - current;
  if (Math.abs(delta) < TREND_EPSILON_EUR_PER_KWH) return "flat";
  return delta > 0 ? "up" : "down";
}

export default function LiveSignalCard({
  signal,
  windows,
  className,
}: LiveSignalCardProps) {
  const { priceEurPerKwh: price, nextPriceEurPerKwh: nextPrice, mode } = signal;
  const trend = trendDirection(price, nextPrice);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Activity className="size-5" />
            Live grid signal
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
        <div className="grid grid-cols-2 items-stretch gap-3">
          <div className="rounded-lg border p-3">
            <Gauge
              label="Price now"
              value={fmtPrice(price)}
              unit="€/kWh"
              tone={priceTone(price)}
            />
          </div>
          <div className="rounded-lg border p-3">
            <Gauge
              label="Price trend 1h"
              value={nextPrice === null ? "—" : fmtPrice(nextPrice)}
              unit={nextPrice === null ? "not yet published" : "€/kWh"}
              tone={nextPrice === null ? "neutral" : priceTone(nextPrice)}
            />
            <TrendBadge
              direction={trend}
              delta={nextPrice === null ? null : nextPrice - price}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Average price trend
          </p>
          <div className="grid grid-cols-3 gap-3">
            <WindowTrendCell
              label="3h"
              avg={windows.next3hAvgEurPerKwh}
              current={price}
            />
            <WindowTrendCell
              label="6h"
              avg={windows.next6hAvgEurPerKwh}
              current={price}
            />
            <WindowTrendCell
              label="Max window"
              avg={windows.next24hAvgEurPerKwh}
              current={price}
              isForecast={windows.next24hHasForecast}
            />
          </div>
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
  tone: Tone;
}) {
  return (
    <>
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", toneClass(tone))}>
        {value}
      </p>
      <p className="text-muted-foreground text-xs">{unit}</p>
    </>
  );
}

function WindowTrendCell({
  label,
  avg,
  current,
  isForecast = false,
}: {
  label: string;
  avg: number | null;
  current: number;
  isForecast?: boolean;
}) {
  const tone: Tone = avg === null ? "neutral" : priceTone(avg);
  const direction = trendDirection(current, avg);
  return (
    <div className="flex flex-col items-center rounded-lg border p-2 text-center">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
        {isForecast && (
          <span className="text-muted-foreground/70 ml-1 normal-case">· fc</span>
        )}
      </p>
      <p
        className={cn("mt-1 text-lg font-semibold tabular-nums", toneClass(tone))}
      >
        {avg === null ? "—" : fmtPrice(avg)}
      </p>
      <TrendBadge direction={direction} delta={avg === null ? null : avg - current} />
    </div>
  );
}

function TrendBadge({
  direction,
  delta,
}: {
  direction: TrendDirection | null;
  delta: number | null;
}) {
  const meta =
    direction === "up"
      ? {
        Icon: TrendingUp,
        tone: "text-grid-red",
        srLabel: "rising",
      }
      : direction === "down"
        ? {
          Icon: TrendingDown,
          tone: "text-grid-green",
          srLabel: "falling",
        }
        : {
          Icon: MoveRight,
          tone: "text-muted-foreground",
          srLabel: direction === null ? "no forecast" : "stable",
        };
  const Icon = meta.Icon;
  const deltaLabel =
    delta === null
      ? null
      : `${delta >= 0 ? "+" : ""}${fmtPrice(delta)}`;
  return (
    <div
      className="flex items-center justify-center gap-1 px-1"
      aria-label={`Next-hour price ${meta.srLabel}`}
    >
      <Icon className={cn("size-6", meta.tone)} />
      {deltaLabel && (
        <span className={cn("text-lg tabular-nums", meta.tone)}>
          {deltaLabel}
        </span>
      )}
    </div>
  );
}

function ModeBanner({ mode }: { mode: SignalMode }) {
  const meta = {
    discharge: {
      icon: ArrowUpFromLine,
      label: "Feed back to grid",
      detail: "High market price + low grid load -> feed energy back to grid.",
      cls: "border-grid-green/40 bg-grid-green/10 text-grid-green",
    },
    hold: {
      icon: Activity,
      label: "Hold",
      detail: "Mixed signal -> hold charge or trickle-charge.",
      cls: "border-grid-amber/40 bg-grid-amber/10 text-grid-amber",
    },
    charge: {
      icon: ArrowDownToLine,
      label: "Charge from grid",
      detail: "Cheap, low-carbon energy + high grid load -> top up batteries now.",
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
