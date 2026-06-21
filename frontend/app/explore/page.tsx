"use client";
import { Suspense } from "react";
import { useApi } from "@/lib/useApi";
import type { ExploreOptions, ExploreSeries, Series, CategoryRow } from "@/lib/api";
import { useQueryState } from "@/lib/useQueryState";
import { downloadCSV } from "@/lib/export";
import PageHeader from "@/components/PageHeader";
import PillGroup from "@/components/PillGroup";
import CopyLinkButton from "@/components/CopyLinkButton";
import LineSeriesChart from "@/components/LineSeriesChart";
import CategoryBarChart from "@/components/CategoryBarChart";
import StateWrapper from "@/components/StateWrapper";

const isTotal = (s: string | null) => !!s && /^total$/i.test(s);
const selectCls = "rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

function ExploreInner() {
  const opts = useApi<ExploreOptions>("/explore/options");
  const [source, setSource] = useQueryState<string>("source", "raw.lfs_rates");
  const [indicator, setIndicator] = useQueryState<string>("indicator", "");
  const [sex, setSex] = useQueryState<string>("sex", "Both Sexes");
  const [view, setView] = useQueryState<string>("view", "trend");

  const datasets = opts.data?.datasets ?? [];
  const ds = datasets.find((d) => d.source === source) ?? datasets[0];

  // Resolve effective controls against the chosen dataset.
  const indicators = ds?.indicators ?? [];
  const effInd = indicators.includes(indicator) ? indicator : (indicators[0] ?? "");
  const canBreakdown = !!ds && (ds.has_age || ds.categories.length > 0);
  const effView = canBreakdown ? view : "trend";

  const qs = new URLSearchParams({ source: ds?.source ?? source });
  if (effInd) qs.set("indicator", effInd);
  if (ds?.has_sex) qs.set("sex", sex);
  const series = useApi<ExploreSeries>(ds ? `/explore/series?${qs.toString()}` : null);

  const rows = series.data?.rows ?? [];
  // Trend: the aggregate over time (Total age band / TOTAL category).
  const trend: Series = {
    indicator: effInd || ds?.label || "", sex, period: "Monthly",
    data: rows.filter((r) => isTotal(r.age_group) || isTotal(r.category) || (!ds?.has_age && !ds?.categories.length))
      .map((r) => ({ year: r.year, month: r.month, value: r.value, unit: r.unit })),
  };
  // Breakdown: latest year across categories or age bands (excluding Total).
  const latestYear = Math.max(0, ...rows.filter((r) => r.value != null).map((r) => r.year));
  const breakdown: CategoryRow[] = rows
    .filter((r) => r.year === latestYear && r.value != null && !isTotal(r.age_group) && !isTotal(r.category) && r.age_group !== "Total")
    .map((r) => ({ category: r.category ?? r.age_group, value: r.value, unit: r.unit }));

  const exportRows = effView === "breakdown"
    ? breakdown.map((b) => ({ category: b.category, value: b.value, unit: b.unit }))
    : trend.data.map((p) => ({ period: `${p.month ?? ""} ${p.year}`.trim(), value: p.value, unit: p.unit }));

  return (
    <div>
      <PageHeader
        title="Data Explorer"
        context="Build your own view: pick any dataset, indicator, and breakdown from the full PSA series, then download exactly what you see.">
        <CopyLinkButton />
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted">
          Dataset
          <select className={selectCls} value={ds?.source ?? ""} onChange={(e) => { setSource(e.target.value); setIndicator(""); }}>
            {datasets.map((d) => <option key={d.source} value={d.source}>{d.label}</option>)}
          </select>
        </label>
        {indicators.length > 1 && (
          <label className="flex items-center gap-2 text-xs font-medium text-muted">
            Indicator
            <select className={selectCls} value={effInd} onChange={(e) => setIndicator(e.target.value)}>
              {indicators.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
        )}
        {ds?.has_sex && (
          <PillGroup label="Sex" value={sex} onChange={setSex}
            options={[{ value: "Both Sexes", label: "All" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }]} />
        )}
        {canBreakdown && (
          <PillGroup label="View" value={effView} onChange={setView}
            options={[{ value: "trend", label: "Over time" }, { value: "breakdown", label: "Breakdown" }]} />
        )}
      </div>

      <StateWrapper isLoading={opts.isLoading || series.isLoading} error={opts.error || series.error}
        isEmpty={!series.isLoading && rows.length === 0}>
        <div className="space-y-6">
          {effView === "breakdown"
            ? <CategoryBarChart rows={breakdown} label={`${ds?.label ?? "Data"} — latest year`} topN={14} />
            : <LineSeriesChart series={trend} label={`${effInd || ds?.label || "Series"} over time`} />}

          <div className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <h3 className="text-sm font-semibold text-ink">Data ({exportRows.length} rows)</h3>
              <button onClick={() => downloadCSV(exportRows as Record<string, unknown>[], "workwise-explore.csv")}
                disabled={!exportRows.length}
                className="rounded px-2 py-0.5 text-xs font-medium text-muted hover:bg-accent-weak hover:text-accent disabled:opacity-40">
                Download CSV
              </button>
            </div>
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-left text-sm nums">
                <thead className="sticky top-0 bg-surface-2 text-xs uppercase tracking-wide text-muted">
                  <tr>{Object.keys(exportRows[0] ?? { key: "" }).map((k) => <th key={k} className="px-4 py-2 font-medium">{k}</th>)}</tr>
                </thead>
                <tbody>
                  {exportRows.slice(0, 200).map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      {Object.values(r).map((v, j) => <td key={j} className="px-4 py-1.5 text-ink">{v == null ? "—" : String(v)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </StateWrapper>
    </div>
  );
}

export default function Explore() {
  return <Suspense><ExploreInner /></Suspense>;
}
