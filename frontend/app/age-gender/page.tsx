"use client";
import { useState } from "react";
import { SEX_FILTER_OPTIONS, type SexFilter } from "@/lib/filters";
import PageHeader from "@/components/PageHeader";
import PillGroup from "@/components/PillGroup";
import SexComparableAgeBars from "@/components/SexComparableAgeBars";

export default function AgeGender() {
  const [sex, setSex] = useState<SexFilter>("compare");

  return (
    <div>
      <PageHeader
        title="Age & Gender Labor Gap"
        context="How employment and unemployment spread across age groups — Compare overlays the male and female labor markets side by side.">
        <PillGroup label="Sex" options={SEX_FILTER_OPTIONS} value={sex} onChange={setSex} />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <SexComparableAgeBars source="employed" sex={sex} label="Employed persons" />
        <SexComparableAgeBars source="unemployed" sex={sex} label="Unemployed persons" />
      </div>
    </div>
  );
}
