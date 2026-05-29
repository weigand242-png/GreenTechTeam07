import HeaderBox from "@/components/features/dashboard/HeaderBox";
import LiveSignalCard from "@/components/features/dashboard/LiveSignalCard";
import PotentialV2GCard from "@/components/features/dashboard/PotentialV2GCard";
import PriceLoadWeatherChart from "@/components/features/dashboard/PriceLoadWeatherChart";
import { getFleetSnapshot } from "@/lib/sessions";
import { currentHourSignal } from "@/lib/signal/current_hour";
import { forwardWindows } from "@/lib/signal/forward_windows";
import { getActiveProvider } from "@/lib/timeseries";

// new Date() drives the current-hour signal; render on every request so the
// signal tracks real time. External fetches still cache via next.revalidate.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const snap = getFleetSnapshot();
  const window = await getActiveProvider().getWindow();
  const now = new Date();
  const signal = currentHourSignal(window.points, now);
  const windows = forwardWindows(window.points, now);
  const isFallback = window.providerId === "live-fallback";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <HeaderBox
        title="V2G Fleet Dashboard"
        subtitle="Turning idle company cars into grid-balancing batteries."
      />
      {isFallback && (
        <p className="text-muted-foreground -mt-2 text-xs">
          Live grid feed unavailable — showing static demo data.
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <PotentialV2GCard
          averageBatteryKwh={snap.averageBatteryKwh}
          priceEurPerKwh={signal.priceEurPerKwh}
          forecastAvgEurPerKwh={windows.next24hAvgEurPerKwh}
          forecastPeakEurPerKwh={windows.next24hPeakEurPerKwh}
          forecastPeakHourIso={windows.next24hPeakHourIso}
          forecastHasForecastData={windows.next24hHasForecast}
        />
        <LiveSignalCard signal={signal} windows={windows} />
      </div>
      <PriceLoadWeatherChart
        points={window.points}
        providerId={window.providerId}
      />
    </div>
  );
}
