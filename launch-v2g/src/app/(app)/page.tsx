import GridIntensityCard from "@/components/features/dashboard/GridIntensityCard";
import HeaderBox from "@/components/features/dashboard/HeaderBox";
import PotentialV2GCard from "@/components/features/dashboard/PotentialV2GCard";
import PriceLoadWeatherChart from "@/components/features/dashboard/PriceLoadWeatherChart";
import { getFleetSnapshot } from "@/lib/sessions";
import { getActiveProvider } from "@/lib/timeseries";

export default async function DashboardPage() {
  const snap = getFleetSnapshot();
  const window = await getActiveProvider().getWindow();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <HeaderBox
        title="V2G Fleet Dashboard"
        subtitle="Turning idle company cars into grid-balancing batteries."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <PotentialV2GCard
          className="lg:col-span-2"
          capacityKwh={snap.potentialV2GCapacityKwh}
          revenueEur={snap.potentialV2GRevenueEur}
        />
        <GridIntensityCard />
      </div>
      <PriceLoadWeatherChart
        points={window.points}
        providerId={window.providerId}
      />
    </div>
  );
}
