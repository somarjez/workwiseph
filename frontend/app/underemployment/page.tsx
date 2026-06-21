"use client";
import { Suspense } from "react";
import { SEX_FILTER_OPTIONS, RANGE_OPTIONS, rangeYears, type SexFilter, type Range } from "@/lib/filters";
import { useQueryState } from "@/lib/useQueryState";
import PageHeader from "@/components/PageHeader";
import PillGroup from "@/components/PillGroup";
import CopyLinkButton from "@/components/CopyLinkButton";
import SexComparableLine from "@/components/SexComparableLine";
import SexComparableAgeBars from "@/components/SexComparableAgeBars";

function UnderemploymentInner() {
  const [sex, setSex] = useQueryState<SexFilter>("sex", "Both Sexes");
  const [range, setRange] = useQueryState<Range>("range", "all");

  return (
    <div>
      <PageHeader
        title="Underemployment Deep Dive"
        context="The project's focus: workers who have jobs but want more hours or better pay — how the rate has moved, and who carries it. Switch to Compare to see the gap between men and women.">
        <PillGroup label="Sex" options={SEX_FILTER_OPTIONS} value={sex} onChange={setSex} />
        <PillGroup label="Range" options={RANGE_OPTIONS} value={range} onChange={setRange} />
        <CopyLinkButton />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <SexComparableLine indicator="Underemployment Rate" sex={sex} lastYears={rangeYears(range)} label="Underemployment rate" />
        <SexComparableAgeBars source="underemployed" sex={sex} label="Underemployed persons" />
      </div>
    </div>
  );
}

export default function Underemployment() {
  return <Suspense><UnderemploymentInner /></Suspense>;
}
