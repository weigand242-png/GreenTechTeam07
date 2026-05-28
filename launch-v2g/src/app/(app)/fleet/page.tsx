import FleetStatusCard from "@/components/features/dashboard/FleetStatusCard";
import HeaderBox from "@/components/features/dashboard/HeaderBox";
import RecentSessionsCard from "@/components/features/dashboard/RecentSessionsCard";
import { getFleetSnapshot } from "@/lib/sessions";

export default function FleetPage() {
  const snap = getFleetSnapshot();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <HeaderBox
        title="Fleet"
        subtitle="Vehicles enrolled in the V2G programme."
      />
      <div className="grid gap-4 lg:grid-cols-3">
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
