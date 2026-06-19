"use client";
import { useApi } from "@/lib/useApi";
import type { SectorResp, PayResp, Series } from "@/lib/api";
import CategoryBarChart from "@/components/CategoryBarChart";
import LineSeriesChart from "@/components/LineSeriesChart";
import StateWrapper from "@/components/StateWrapper";

export default function Industry() {
  const industry = useApi<SectorResp>("/industry/employment");
  const occupation = useApi<SectorResp>("/occupation/employment");
  const pay = useApi<PayResp>("/pay/industry");

  const industryTrend: Series | undefined = industry.data && {
    indicator: "Total Employed", sex: "Both Sexes", period: "Monthly",
    data: industry.data.total_series,
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Industry &amp; Occupation Trends</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <StateWrapper isLoading={industry.isLoading} error={industry.error} isEmpty={!industry.data?.latest.length}>
          {industry.data && <CategoryBarChart rows={industry.data.latest} label="Top industries by employment (latest)" />}
        </StateWrapper>
        <StateWrapper isLoading={industry.isLoading} error={industry.error}>
          {industryTrend && <LineSeriesChart series={industryTrend} label="Total employment trend" />}
        </StateWrapper>
        <StateWrapper isLoading={occupation.isLoading} error={occupation.error} isEmpty={!occupation.data?.latest.length}>
          {occupation.data && <CategoryBarChart rows={occupation.data.latest} label="Top occupations by employment (latest)" />}
        </StateWrapper>
        <StateWrapper isLoading={pay.isLoading} error={pay.error} isEmpty={!pay.data?.latest.length}>
          {pay.data && <CategoryBarChart rows={pay.data.latest} label="Average daily basic pay by industry (₱, latest)" />}
        </StateWrapper>
      </div>
    </div>
  );
}
