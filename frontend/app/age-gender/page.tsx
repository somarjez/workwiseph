"use client";
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import type { AgeSex } from "@/lib/api";
import { SEX_OPTIONS, type Sex } from "@/lib/filters";
import AgeBarChart from "@/components/AgeBarChart";
import StateWrapper from "@/components/StateWrapper";
import PageHeader from "@/components/PageHeader";
import PillGroup from "@/components/PillGroup";

export default function AgeGender() {
  const [sex, setSex] = useState<Sex>("Both Sexes");
  const q = `&sex=${encodeURIComponent(sex)}`;
  const employed = useApi<AgeSex>(`/labor/age-sex?source=employed${q}`);
  const unemployed = useApi<AgeSex>(`/labor/age-sex?source=unemployed${q}`);

  return (
    <div>
      <PageHeader
        title="Age & Gender Labor Gap"
        context="How employment and unemployment are distributed across age groups — switch sex to compare the male and female labor markets.">
        <PillGroup label="Sex" options={SEX_OPTIONS} value={sex} onChange={setSex} />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <StateWrapper isLoading={employed.isLoading} error={employed.error} isEmpty={!employed.data?.data.length}>
          {employed.data && <AgeBarChart rows={employed.data.data} label="Employed persons by age group (latest year)" />}
        </StateWrapper>
        <StateWrapper isLoading={unemployed.isLoading} error={unemployed.error} isEmpty={!unemployed.data?.data.length}>
          {unemployed.data && <AgeBarChart rows={unemployed.data.data} label="Unemployed persons by age group (latest year)" />}
        </StateWrapper>
      </div>
    </div>
  );
}
