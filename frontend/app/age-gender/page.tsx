"use client";
import { Suspense } from "react";
import { SEX_FILTER_OPTIONS, type SexFilter } from "@/lib/filters";
import { useQueryState } from "@/lib/useQueryState";
import PageHeader from "@/components/PageHeader";
import PillGroup from "@/components/PillGroup";
import CopyLinkButton from "@/components/CopyLinkButton";
import SexComparableAgeBars from "@/components/SexComparableAgeBars";

function AgeGenderInner() {
  const [sex, setSex] = useQueryState<SexFilter>("sex", "compare");

  return (
    <div>
      <PageHeader
        title="Age & Gender Labor Gap"
        context="How employment and unemployment spread across age groups — Compare overlays the male and female labor markets side by side.">
        <PillGroup label="Sex" options={SEX_FILTER_OPTIONS} value={sex} onChange={setSex} />
        <CopyLinkButton />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <SexComparableAgeBars source="employed" sex={sex} label="Employed persons" />
        <SexComparableAgeBars source="unemployed" sex={sex} label="Unemployed persons" />
      </div>
    </div>
  );
}

export default function AgeGender() {
  return <Suspense><AgeGenderInner /></Suspense>;
}
