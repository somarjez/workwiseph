"use client";
import { useApi } from "@/lib/useApi";
import type { Series } from "@/lib/api";
import { CHART } from "@/lib/chart";
import LineSeriesChart from "./LineSeriesChart";
import MultiLineChart from "./MultiLineChart";
import StateWrapper from "./StateWrapper";

// A rate trend that renders a single sex, or overlays Male vs Female when
// `sex === "compare"`. Conditional hooks use a null key (SWR skips fetching).
export default function SexComparableLine({ indicator, sex, lastYears, label }: {
  indicator: string; sex: string; lastYears?: number; label: string;
}) {
  const compare = sex === "compare";
  const enc = encodeURIComponent(indicator);
  const single = useApi<Series>(!compare ? `/labor/rates?indicator=${enc}&sex=${encodeURIComponent(sex)}` : null);
  const male = useApi<Series>(compare ? `/labor/rates?indicator=${enc}&sex=Male` : null);
  const female = useApi<Series>(compare ? `/labor/rates?indicator=${enc}&sex=Female` : null);

  if (compare) {
    return (
      <StateWrapper isLoading={male.isLoading || female.isLoading}
        error={male.error || female.error} isEmpty={!male.data?.data.length}>
        {male.data && female.data && (
          <MultiLineChart label={`${label}: male vs female`} lastYears={lastYears}
            series={[
              { name: "Male", color: CHART.accent, data: male.data.data },
              { name: "Female", color: CHART.accent2, data: female.data.data },
            ]} />
        )}
      </StateWrapper>
    );
  }
  return (
    <StateWrapper isLoading={single.isLoading} error={single.error} isEmpty={!single.data?.data.length}>
      {single.data && <LineSeriesChart series={single.data} lastYears={lastYears} label={`${label} over time`} />}
    </StateWrapper>
  );
}
