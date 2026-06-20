"use client";
import { useApi } from "@/lib/useApi";
import type { AgeSex } from "@/lib/api";
import AgeBarChart from "@/components/AgeBarChart";
import StateWrapper from "@/components/StateWrapper";
import PageHeader from "@/components/PageHeader";

export default function AgeGender() {
  const employed = useApi<AgeSex>("/labor/age-sex?source=employed");
  const unemployed = useApi<AgeSex>("/labor/age-sex?source=unemployed");
  return (
    <div>
      <PageHeader
        title="Age & Gender Labor Gap"
        context="How employment and unemployment are distributed across age groups — where the labor market concentrates and where young workers sit."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <StateWrapper isLoading={employed.isLoading} error={employed.error} isEmpty={!employed.data}>
          {employed.data && <AgeBarChart rows={employed.data.data} label="Employed persons by age group (latest year)" />}
        </StateWrapper>
        <StateWrapper isLoading={unemployed.isLoading} error={unemployed.error} isEmpty={!unemployed.data}>
          {unemployed.data && <AgeBarChart rows={unemployed.data.data} label="Unemployed persons by age group (latest year)" />}
        </StateWrapper>
      </div>
    </div>
  );
}
