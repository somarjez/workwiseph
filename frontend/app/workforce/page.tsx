"use client";
import { useApi } from "@/lib/useApi";
import type { SectorResp, MeanHoursResp, Series } from "@/lib/api";
import CategoryBarChart from "@/components/CategoryBarChart";
import LineSeriesChart from "@/components/LineSeriesChart";
import StateWrapper from "@/components/StateWrapper";

export default function Workforce() {
  const workerClass = useApi<SectorResp>("/worker-class");
  const hours = useApi<SectorResp>("/hours-worked");
  const meanHours = useApi<MeanHoursResp>("/mean-hours");

  const meanSeries: Series | undefined = meanHours.data && {
    indicator: "Mean Hours Worked", sex: "Both Sexes", period: "Monthly",
    data: meanHours.data.series,
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Workforce Composition</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <StateWrapper isLoading={workerClass.isLoading} error={workerClass.error} isEmpty={!workerClass.data?.latest.length}>
          {workerClass.data && <CategoryBarChart rows={workerClass.data.latest} label="Employed by class of worker (latest)" topN={10} />}
        </StateWrapper>
        <StateWrapper isLoading={hours.isLoading} error={hours.error} isEmpty={!hours.data?.latest.length}>
          {hours.data && <CategoryBarChart rows={hours.data.latest} label="Employed by hours worked (latest)" topN={8} />}
        </StateWrapper>
        <StateWrapper isLoading={meanHours.isLoading} error={meanHours.error} isEmpty={!meanSeries?.data.length}>
          {meanSeries && <LineSeriesChart series={meanSeries} label="Mean hours worked per week (trend)" />}
        </StateWrapper>
      </div>
    </div>
  );
}
