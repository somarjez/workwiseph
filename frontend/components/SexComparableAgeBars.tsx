"use client";
import { useApi } from "@/lib/useApi";
import type { AgeSex } from "@/lib/api";
import AgeBarChart from "./AgeBarChart";
import GroupedAgeBarChart from "./GroupedAgeBarChart";
import StateWrapper from "./StateWrapper";

// Age-group bars for one sex, or grouped Male vs Female when `sex === "compare"`.
export default function SexComparableAgeBars({ source, sex, label }: {
  source: string; sex: string; label: string;
}) {
  const compare = sex === "compare";
  const single = useApi<AgeSex>(!compare ? `/labor/age-sex?source=${source}&sex=${encodeURIComponent(sex)}` : null);
  const male = useApi<AgeSex>(compare ? `/labor/age-sex?source=${source}&sex=Male` : null);
  const female = useApi<AgeSex>(compare ? `/labor/age-sex?source=${source}&sex=Female` : null);

  if (compare) {
    return (
      <StateWrapper isLoading={male.isLoading || female.isLoading}
        error={male.error || female.error} isEmpty={!male.data?.data.length}>
        {male.data && female.data && (
          <GroupedAgeBarChart male={male.data.data} female={female.data.data}
            label={`${label} by age, male vs female (latest year)`} />
        )}
      </StateWrapper>
    );
  }
  return (
    <StateWrapper isLoading={single.isLoading} error={single.error} isEmpty={!single.data?.data.length}>
      {single.data && <AgeBarChart rows={single.data.data} label={`${label} by age group (latest year)`} />}
    </StateWrapper>
  );
}
