"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
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
import type { Season, SeasonWeekPoint } from "@/lib/market";

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

const SEASON_META: Record<Season, { label: string; color: string }> = {
  spring: { label: "Spring (Frühling)", color: "#10b981" },
  summer: { label: "Summer (Sommer)", color: "#f59e0b" },
  autumn: { label: "Autumn (Herbst)", color: "#ef4444" },
  winter: { label: "Winter", color: "#3b82f6" },
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  seasons: Record<Season, SeasonWeekPoint[]>;
  className?: string;
}

export default function SeasonWeekChart({ seasons, className }: Props) {
  const data = useMemo<ChartData<"line">>(
    () => ({
      datasets: (Object.keys(SEASON_META) as Season[]).map((season) => ({
        label: SEASON_META[season].label,
        data: seasons[season].map((p) => ({
          x: p.hourOfWeek,
          y: p.priceEurPerMwh,
        })),
        borderColor: SEASON_META[season].color,
        backgroundColor: SEASON_META[season].color,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 1.75,
      })),
    }),
    [seasons],
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
              const hourOfWeek = items[0]?.parsed.x;
              if (typeof hourOfWeek !== "number") return "";
              const day = DAY_LABELS[Math.floor(hourOfWeek / 24)] ?? "";
              const hour = hourOfWeek % 24;
              return `${day} ${hour.toString().padStart(2, "0")}:00`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          min: 0,
          max: 167,
          ticks: {
            stepSize: 24,
            callback: (value) => {
              const v = typeof value === "number" ? value : Number(value);
              const idx = Math.round(v / 24);
              return DAY_LABELS[idx] ?? "";
            },
          },
          grid: { display: false },
        },
        y: {
          type: "linear",
          position: "left",
          title: { display: true, text: "€/MWh" },
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
          Typical week by season — 2025 average
        </CardTitle>
        <CardDescription>
          Day-ahead price averaged across each season, hour by hour over a
          representative Mon–Sun week. Source: <code>average_*_week.csv</code>.
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
