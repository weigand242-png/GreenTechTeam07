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
import type { DailyPricePoint } from "@/lib/market";

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

interface Props {
  points: DailyPricePoint[];
  className?: string;
}

export default function YearlyPriceChart({ points, className }: Props) {
  const data = useMemo<ChartData<"line">>(
    () => ({
      datasets: [
        {
          label: "Daily mean price (€/MWh)",
          data: points.map((p) => ({
            x: new Date(p.date).getTime(),
            y: p.meanEurPerMwh,
          })),
          borderColor: COLOR_PRICE,
          backgroundColor: COLOR_PRICE,
          yAxisID: "yPrice",
          tension: 0.2,
          pointRadius: 0,
          borderWidth: 1.5,
          spanGaps: true,
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
                ? new Date(ts).toLocaleDateString("de-DE", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
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
            unit: "month",
            displayFormats: { month: "MMM" },
            tooltipFormat: "dd MMM yyyy",
          },
          ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
          grid: { display: false },
        },
        yPrice: {
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
          Day-ahead price 2025 — daily mean (DE/LU)
        </CardTitle>
        <CardDescription>
          Daily mean of hourly wholesale prices across 2025. Source:{" "}
          <code>Grosshandelspreise_2025_Deutschland_je_Stunde.csv</code>.
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
