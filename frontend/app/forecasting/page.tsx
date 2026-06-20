"use client";
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import type { ForecastResp, AnomalyResp } from "@/lib/api";
import ForecastChart from "@/components/ForecastChart";
import StateWrapper from "@/components/StateWrapper";
import PageHeader from "@/components/PageHeader";
import PillGroup from "@/components/PillGroup";
import type { Option } from "@/components/PillGroup";

const INDICATORS = [
  "Unemployment Rate", "Underemployment Rate",
  "Employment Rate", "Labor Force Participation Rate",
];
const MODELS: Option<string>[] = [
  { value: "ets", label: "Holt-Winters" },
  { value: "rf", label: "Random Forest" },
];
const ANOM: Option<string>[] = [
  { value: "off", label: "Off" },
  { value: "zscore", label: "Z-score" },
  { value: "iforest", label: "Isolation Forest" },
];

function Metric({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="nums text-2xl font-semibold tracking-tight text-ink">
        {value == null ? "—" : value.toFixed(2)}
      </div>
      <div className="mt-1 text-xs font-medium text-muted">{label}</div>
    </div>
  );
}

export default function Forecasting() {
  const [indicator, setIndicator] = useState(INDICATORS[0]);
  const [method, setMethod] = useState("ets");
  const [anom, setAnom] = useState("zscore");
  const enc = encodeURIComponent(indicator);

  const { data, error, isLoading } = useApi<ForecastResp>(`/forecast?indicator=${enc}&method=${method}`);
  const anomalies = useApi<AnomalyResp>(anom !== "off" ? `/anomalies?indicator=${enc}&method=${anom}` : null);

  const flagged = new Set(
    (anomalies.data?.points ?? []).filter((p) => p.is_anomaly).map((p) => p.reference_date.slice(0, 7)));

  return (
    <div>
      <PageHeader
        title="Forecasting"
        context="Six-month projections with a 95% confidence band, backtested on held-out months. Trained on monthly data from 2021 onward."
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {INDICATORS.map((ind) => (
          <button key={ind} onClick={() => setIndicator(ind)} aria-pressed={ind === indicator}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              ind === indicator ? "bg-accent text-white" : "border border-border bg-surface text-muted hover:text-ink"
            }`}>
            {ind}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2">
        <PillGroup label="Model" options={MODELS} value={method} onChange={setMethod} />
        <PillGroup label="Anomalies" options={ANOM} value={anom} onChange={setAnom} />
      </div>

      <StateWrapper isLoading={isLoading} error={error} isEmpty={!data?.history.length}>
        {data && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 sm:max-w-md">
              <Metric label="MAE" value={data.metrics.mae} />
              <Metric label="RMSE" value={data.metrics.rmse} />
              <Metric label="MAPE %" value={data.metrics.mape} />
            </div>
            <ForecastChart data={data} anomalies={flagged} label={`${indicator}: actual vs forecast`} />
          </div>
        )}
      </StateWrapper>
    </div>
  );
}
