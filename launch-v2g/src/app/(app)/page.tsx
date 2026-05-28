import FleetStatusCard from "@/components/features/dashboard/FleetStatusCard";
import GridIntensityCard from "@/components/features/dashboard/GridIntensityCard";
import HeaderBox from "@/components/features/dashboard/HeaderBox";
import PotentialV2GCard from "@/components/features/dashboard/PotentialV2GCard";
import RecentSessionsCard from "@/components/features/dashboard/RecentSessionsCard";
import { getFleetSnapshot } from "@/lib/sessions";

export default function DashboardPage() {
  const snap = getFleetSnapshot();

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
        <FleetStatusCard
          totalVehicles={snap.totalVehicles}
          totalSessions={snap.totalSessions}
          averageBatteryKwh={snap.averageBatteryKwh}
          vehiclesBySegment={snap.vehiclesBySegment}
        />
        <RecentSessionsCard
          className="lg:col-span-2"
          sessions={snap.recentSessions}
        />
      </div>
    </div>
  );
}
