"use client";
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import type { ForecastResp } from "@/lib/api";
import ForecastChart from "@/components/ForecastChart";
import StateWrapper from "@/components/StateWrapper";
import PageHeader from "@/components/PageHeader";

const INDICATORS = [
  "Unemployment Rate", "Underemployment Rate",
  "Employment Rate", "Labor Force Participation Rate",
];
const MODELS = [
  { id: "ets", label: "Holt-Winters" },
  { id: "rf", label: "Random Forest" },
];

function Pill({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        active ? "bg-accent text-white" : "border border-border bg-surface text-muted hover:text-ink"
      }`}>
      {children}
    </button>
  );
}

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
  const { data, error, isLoading } = useApi<ForecastResp>(
    `/forecast?indicator=${encodeURIComponent(indicator)}&method=${method}`);

  return (
    <div>
      <PageHeader
        title="Forecasting"
        context="Six-month projections with a 95% confidence band, backtested on held-out months. Trained on monthly data from 2021 onward."
      />
      <div className="mb-3 flex flex-wrap gap-2">
        {INDICATORS.map((ind) => (
          <Pill key={ind} active={ind === indicator} onClick={() => setIndicator(ind)}>{ind}</Pill>
        ))}
      </div>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Model</span>
        {MODELS.map((m) => (
          <Pill key={m.id} active={m.id === method} onClick={() => setMethod(m.id)}>{m.label}</Pill>
        ))}
      </div>
      <StateWrapper isLoading={isLoading} error={error} isEmpty={!data?.history.length}>
        {data && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 sm:max-w-md">
              <Metric label="MAE" value={data.metrics.mae} />
              <Metric label="RMSE" value={data.metrics.rmse} />
              <Metric label="MAPE %" value={data.metrics.mape} />
            </div>
            <ForecastChart data={data} label={`${indicator}: actual vs forecast`} />
          </div>
        )}
      </StateWrapper>
    </div>
  );
}
