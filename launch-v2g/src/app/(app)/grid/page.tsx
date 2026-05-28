import HeaderBox from "@/components/features/dashboard/HeaderBox";
import SeasonWeekChart from "@/components/features/grid/SeasonWeekChart";
import YearlyPriceChart from "@/components/features/grid/YearlyPriceChart";
import {
  getSeasonAveragedWeeks,
  getYearlyDailyMeanPrices,
} from "@/lib/market";

export default function GridPage() {
  const yearly = getYearlyDailyMeanPrices();
  const seasons = getSeasonAveragedWeeks();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <HeaderBox
        title="Grid"
        subtitle="Grid intensity, pricing signals and dispatch windows."
      />
      <YearlyPriceChart points={yearly} />
      <SeasonWeekChart seasons={seasons} />
    </div>
  );
}
