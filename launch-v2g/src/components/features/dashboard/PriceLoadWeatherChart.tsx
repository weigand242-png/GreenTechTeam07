"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HourMode } from "@/lib/signal/forward_modes";
import type { SignalMode } from "@/lib/signal/current_hour";
import type { HourlyPoint } from "@/lib/timeseries";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
  type Chart,
  type ChartData,
  type ChartOptions,
  type Plugin,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { LineChart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
);

const COLOR_PRICE = "#ef4444";
const COLOR_LOAD = "#3b82f6";
const COLOR_SOLAR = "#f59e0b";
const COLOR_NOW = "#0ea5e9";

// Suggestion colors mirror LiveSignalCard's ModeBanner: discharge/selling is the
// "good" green state, charging/buying is red, hold is amber.
const MODE_COLOR: Record<SignalMode, string> = {
  discharge: "#16a34a",
  hold: "#d97706",
  charge: "#dc2626",
};

// Stepped-line level per mode: discharge on top, charge at the bottom.
const MODE_Y: Record<SignalMode, number> = {
  discharge: 2,
  hold: 1,
  charge: 0,
};

const MODE_LABEL: Record<number, string> = {
  0: "Charge",
  1: "Hold",
  2: "Discharge",
};

interface Props {
  points: HourlyPoint[];
  modes: HourMode[];
  providerId: string;
  className?: string;
}

interface NowPluginOptions {
  nowMs: number;
}

const nowLinePlugin: Plugin<"line", NowPluginOptions> = {
  id: "nowLine",
  afterDatasetsDraw(chart: Chart, _args, opts: NowPluginOptions) {
    const nowMs = opts?.nowMs;
    if (!nowMs) return;
    const xScale = chart.scales.x;
    if (!xScale) return;
    const { left, right, top, bottom } = chart.chartArea;
    const x = xScale.getPixelForValue(nowMs);
    if (x < left || x > right) return;
    const ctx = chart.ctx;
    ctx.save();
    ctx.strokeStyle = COLOR_NOW;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLOR_NOW;
    ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    const pad = 4;
    const labelX = Math.min(x + pad, right - 40);
    ctx.fillText("now", labelX, top + pad);
    ctx.restore();
  },
};

export default function PriceLoadWeatherChart({
  points,
  modes,
  providerId,
  className,
}: Props) {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const data = useMemo<ChartData<"line">>(
    () => ({
      datasets: [
        {
          label: "Price (€/MWh)",
          data: points.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.priceEurPerMwh })),
          borderColor: COLOR_PRICE,
          backgroundColor: COLOR_PRICE,
          yAxisID: "yPrice",
          tension: 0.25,
          spanGaps: true,
        },
        {
          label: "Load (MW)",
          data: points.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.loadMw })),
          borderColor: COLOR_LOAD,
          backgroundColor: COLOR_LOAD,
          yAxisID: "yLoad",
          tension: 0.25,
          spanGaps: true,
        },
        {
          label: "Solar (W/m²)",
          data: points.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.solarWPerM2 })),
          borderColor: COLOR_SOLAR,
          backgroundColor: COLOR_SOLAR,
          yAxisID: "yWeather",
          tension: 0.25,
          spanGaps: true,
          borderDash: [4, 4],
        },
        {
          label: "Suggested action",
          data: modes.map((m) => ({ x: m.tsMs, y: MODE_Y[m.mode] })),
          borderColor: MODE_COLOR.hold,
          backgroundColor: MODE_COLOR.hold,
          yAxisID: "yMode",
          stepped: "after",
          tension: 0,
          pointRadius: 0,
          borderWidth: 2,
          // Color each hour-segment by its own mode; dash forecast hours.
          segment: {
            borderColor: (ctx) => {
              const m = modes[ctx.p0DataIndex];
              return m ? MODE_COLOR[m.mode] : MODE_COLOR.hold;
            },
            borderDash: (ctx) =>
              modes[ctx.p0DataIndex]?.isForecast ? [4, 4] : undefined,
          },
        },
      ],
    }),
    [points, modes],
  );

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            title: (items) => {
              const ts = items[0]?.parsed.x;
              return typeof ts === "number"
                ? new Date(ts).toLocaleString("de-DE", {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "";
            },
          },
        },
        // Custom plugin options are typed loosely — Chart.js merges them by id.
        nowLine: { nowMs },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "hour",
            displayFormats: { hour: "HH:mm" },
            tooltipFormat: "EEE HH:mm",
          },
          ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
          grid: { display: false },
        },
        yPrice: {
          type: "linear",
          position: "left",
          title: { display: true, text: "€/MWh" },
        },
        yLoad: {
          type: "linear",
          position: "right",
          title: { display: true, text: "MW" },
          grid: { drawOnChartArea: false },
        },
        yWeather: {
          type: "linear",
          position: "right",
          display: false,
          min: 0,
        },
        yMode: {
          type: "linear",
          position: "right",
          min: -0.2,
          max: 2.2,
          grid: { drawOnChartArea: false },
          ticks: {
            stepSize: 1,
            callback: (value) =>
              MODE_LABEL[typeof value === "number" ? value : Number(value)] ?? "",
          },
        },
      },
    }),
    [nowMs],
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="size-5" />
          Price, load &amp; solar — next 24h
        </CardTitle>
        <CardDescription>
          Day-ahead price, grid load, and expected solar radiation across the planning
          window. The stepped <em>Suggested action</em> line is an indicative
          price-quantile signal — top quartile → discharge, bottom quartile → charge.
          Source: <code>{providerId}</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-80 w-full">
          <Line data={data} options={options} plugins={[nowLinePlugin]} />
        </div>
      </CardContent>
    </Card>
  );
}
