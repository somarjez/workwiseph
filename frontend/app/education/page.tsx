"use client";
import { useApi } from "@/lib/useApi";
import type { SectorResp } from "@/lib/api";
import CategoryBarChart from "@/components/CategoryBarChart";
import StateWrapper from "@/components/StateWrapper";
import PageHeader from "@/components/PageHeader";

export default function Education() {
  const emp = useApi<SectorResp>("/education/employment");
  const und = useApi<SectorResp>("/education/underemployment");

  // Underemployment share (%) per education level at the latest period.
  const share = (() => {
    if (!emp.data || !und.data) return [];
    const empMap = new Map(emp.data.latest.map((r) => [r.category, r.value]));
    return und.data.latest
      .map((r) => {
        const e = empMap.get(r.category);
        const pct = e && r.value != null && e > 0 ? (r.value / e) * 100 : null;
        return { category: r.category, value: pct, unit: "percent" };
      })
      .filter((r) => r.value != null);
  })();

  return (
    <div>
      <PageHeader
        title="Education & Underemployment"
        context="Does more schooling mean better work? Employment and underemployment by highest grade completed — a modern snapshot, Jan 2023 to Apr 2026."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <StateWrapper isLoading={emp.isLoading} error={emp.error} isEmpty={!emp.data?.latest.length}>
          {emp.data && <CategoryBarChart rows={emp.data.latest} label="Employed persons by education (latest)" topN={12} />}
        </StateWrapper>
        <StateWrapper isLoading={und.isLoading} error={und.error} isEmpty={!und.data?.latest.length}>
          {und.data && <CategoryBarChart rows={und.data.latest} label="Underemployed persons by education (latest)" topN={12} />}
        </StateWrapper>
        <StateWrapper isLoading={emp.isLoading || und.isLoading} error={emp.error || und.error} isEmpty={!share.length}>
          <CategoryBarChart rows={share} label="Underemployment share by education (%)" topN={12} />
        </StateWrapper>
      </div>
    </div>
  );
}
