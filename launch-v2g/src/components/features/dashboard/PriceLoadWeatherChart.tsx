"use client";

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
  type ChartData,
  type ChartOptions,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { LineChart } from "lucide-react";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HourlyPoint } from "@/lib/timeseries";

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

interface Props {
  points: HourlyPoint[];
  providerId: string;
  className?: string;
}

export default function PriceLoadWeatherChart({
  points,
  providerId,
  className,
}: Props) {
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
      ],
    }),
    [points],
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
      },
    }),
    [],
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="size-5" />
          Price, load &amp; solar — next 24h
        </CardTitle>
        <CardDescription>
          Day-ahead price, grid load, and solar radiation across the planning
          window. Source: <code>{providerId}</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-80 w-full">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
