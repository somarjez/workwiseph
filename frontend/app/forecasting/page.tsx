"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import type { ForecastResp, AnomalyResp } from "@/lib/api";
import { useQueryState } from "@/lib/useQueryState";
import {
  defaultThreshold, deriveOutlook, normalizeHorizon, normalizeOption, normalizeThreshold,
  type Horizon,
} from "@/lib/outlook";
import ForecastChart from "@/components/ForecastChart";
import StateWrapper from "@/components/StateWrapper";
import PageHeader from "@/components/PageHeader";
import PillGroup from "@/components/PillGroup";
import CopyLinkButton from "@/components/CopyLinkButton";
import type { Option } from "@/components/PillGroup";

const INDICATORS = [
  "Unemployment Rate", "Underemployment Rate",
  "Employment Rate", "Labor Force Participation Rate",
] as const;
const MODELS = ["ets", "rf"] as const;
const ANOMALIES = ["off", "zscore", "iforest"] as const;
const MODEL_OPTIONS: Option<(typeof MODELS)[number]>[] = [
  { value: "ets", label: "Holt-Winters" }, { value: "rf", label: "Random Forest" },
];
const ANOMALY_OPTIONS: Option<(typeof ANOMALIES)[number]>[] = [
  { value: "off", label: "Off" }, { value: "zscore", label: "Z-score" },
  { value: "iforest", label: "Isolation Forest" },
];
const HORIZON_OPTIONS: Option<`${Horizon}`>[] = [
  { value: "3", label: "3 months" }, { value: "6", label: "6 months" },
];

const formatMonth = (iso: string) => new Intl.DateTimeFormat("en-PH", {
  month: "long", year: "numeric", timeZone: "UTC",
}).format(new Date(iso));

function Metric({ label, value, suffix = "" }: { label: string; value?: number | null; suffix?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="nums text-2xl font-semibold tracking-tight text-ink">
        {value == null ? "—" : `${value.toFixed(2)}${suffix}`}
      </div>
      <div className="mt-1 text-xs font-medium text-muted">{label}</div>
    </div>
  );
}

function ForecastingInner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [rawIndicator] = useQueryState<string>("indicator", INDICATORS[0]);
  const [rawMethod, setMethod] = useQueryState<string>("model", "ets");
  const [rawAnomalies, setAnomalies] = useQueryState<string>("anomalies", "zscore");
  const [rawHorizon, setHorizon] = useQueryState<string>("horizon", "6");
  const [rawThreshold, setThreshold] = useQueryState<string>("threshold", "");

  const indicator = normalizeOption(rawIndicator, INDICATORS, INDICATORS[0]);
  const method = normalizeOption(rawMethod, MODELS, "ets");
  const anomalyMethod = normalizeOption(rawAnomalies, ANOMALIES, "zscore");
  const horizon = normalizeHorizon(rawHorizon);
  const enc = encodeURIComponent(indicator);
  const forecast = useApi<ForecastResp>(`/forecast?indicator=${enc}&method=${method}`);
  const anomalies = useApi<AnomalyResp>(
    anomalyMethod !== "off" ? `/anomalies?indicator=${enc}&method=${anomalyMethod}` : null,
  );
  const fallbackThreshold = forecast.data ? defaultThreshold(forecast.data) : 0;
  const threshold = normalizeThreshold(rawThreshold, fallbackThreshold);
  const parsedThreshold = Number(rawThreshold);
  const thresholdInput = rawThreshold !== "" && Number.isFinite(parsedThreshold)
    && parsedThreshold >= 0 && parsedThreshold <= 100
    ? rawThreshold
    : forecast.data ? fallbackThreshold.toFixed(1) : "";
  const outlook = forecast.data
    ? deriveOutlook(forecast.data, horizon, threshold, anomalies.data)
    : null;
  const flagged = new Set(
    (anomalies.data?.points ?? []).filter((point) => point.is_anomaly)
      .map((point) => point.reference_date.slice(0, 7)),
  );

  function changeIndicator(nextIndicator: string) {
    const next = new URLSearchParams(params.toString());
    if (nextIndicator === INDICATORS[0]) next.delete("indicator");
    else next.set("indicator", nextIndicator);
    next.delete("threshold");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const thresholdText = outlook?.thresholdStatus === "above"
    ? `The entire 95% range is above ${threshold.toFixed(1)}%.`
    : outlook?.thresholdStatus === "below"
      ? `The entire 95% range is below ${threshold.toFixed(1)}%.`
      : `The 95% range overlaps ${threshold.toFixed(1)}%, so the model does not clearly place the rate on either side.`;

  return (
    <div>
      <PageHeader
        title="Labor Market Outlook"
        context="Turn a six-month statistical forecast into a clear, shareable finding—with its uncertainty and validation kept visible.">
        <CopyLinkButton />
        <button onClick={() => window.print()} className="print:hidden rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-2">
          Print brief
        </button>
      </PageHeader>

      <section className="print:hidden mb-8 rounded-xl border border-border bg-surface p-5" aria-label="Outlook controls">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold text-muted">What signal are you watching?</p>
            <div className="flex flex-wrap gap-2">
              {INDICATORS.map((item) => (
                <button key={item} onClick={() => changeIndicator(item)} aria-pressed={item === indicator}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    item === indicator ? "bg-accent text-white" : "border border-border bg-surface text-muted hover:text-ink"
                  }`}>
                  {item.replace(" Rate", "")}
                </button>
              ))}
            </div>
          </div>
          <PillGroup label="Target" options={HORIZON_OPTIONS} value={`${horizon}` as `${Horizon}`} onChange={setHorizon} />
          <label className="flex items-center gap-2 text-xs font-medium text-muted">
            Threshold
            <span className="flex items-center rounded-md border border-border bg-bg focus-within:outline focus-within:outline-2 focus-within:outline-accent">
              <input type="number" min="0" max="100" step="0.1" aria-label="Threshold percentage"
                value={thresholdInput} onChange={(event) => setThreshold(event.target.value)}
                className="nums w-20 bg-transparent px-2.5 py-1.5 text-right text-sm text-ink outline-none" />
              <span className="pr-2.5">%</span>
            </span>
          </label>
        </div>
      </section>

      <StateWrapper isLoading={forecast.isLoading} error={forecast.error} isEmpty={!forecast.data?.history.length || !outlook}>
        {forecast.data && outlook && (
          <div className="space-y-6">
            <section className="avoid-break overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border bg-surface-2 px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Generated outlook · {horizon} months</p>
                <h2 className="mt-1 font-display text-2xl font-medium">{indicator}</h2>
              </div>
              <div className="grid gap-px bg-border md:grid-cols-3">
                <article className="bg-surface p-6">
                  <p className="text-xs font-semibold text-muted">Projected direction</p>
                  <p className="mt-3 font-display text-3xl font-medium capitalize text-ink">{outlook.direction}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    From {outlook.latestValue.toFixed(1)}% to {outlook.targetValue.toFixed(1)}% by {formatMonth(outlook.targetMonth)}
                    ({outlook.change >= 0 ? "+" : ""}{outlook.change.toFixed(1)} percentage points).
                  </p>
                </article>
                <article className="bg-surface p-6">
                  <p className="text-xs font-semibold text-muted">Threshold finding</p>
                  <p className="mt-3 font-display text-3xl font-medium capitalize text-accent">{outlook.thresholdStatus}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{thresholdText}</p>
                </article>
                <article className="bg-surface p-6">
                  <p className="text-xs font-semibold text-muted">Uncertainty & unusual months</p>
                  <p className="nums mt-3 font-display text-3xl font-medium">{outlook.intervalLower.toFixed(1)}–{outlook.intervalUpper.toFixed(1)}%</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {outlook.recentAnomalyCount === 0
                      ? "No anomalies were flagged in the latest 12 observations."
                      : `${outlook.recentAnomalyCount} anomalous ${outlook.recentAnomalyCount === 1 ? "month was" : "months were"} flagged in the latest 12 observations.`}
                  </p>
                </article>
              </div>
              <p className="border-t border-border px-6 py-3 text-xs leading-relaxed text-muted">
                This is a short-term statistical projection based on past monthly patterns. It is not a causal prediction, probability estimate, or policy recommendation.
              </p>
            </section>

            <ForecastChart data={forecast.data} anomalies={flagged} label={`${indicator}: actual vs forecast`} />

            <details className="print:hidden rounded-xl border border-border bg-surface">
              <summary className="cursor-pointer px-5 py-4 text-sm font-semibold">Method & validation</summary>
              <div className="border-t border-border p-5">
                <div className="mb-5 flex flex-wrap gap-5">
                  <PillGroup label="Model" options={MODEL_OPTIONS} value={method} onChange={setMethod} />
                  <PillGroup label="Anomalies" options={ANOMALY_OPTIONS} value={anomalyMethod} onChange={setAnomalies} />
                </div>
                <div className="grid grid-cols-3 gap-3 sm:max-w-md">
                  <Metric label="MAE" value={forecast.data.metrics.mae} />
                  <Metric label="RMSE" value={forecast.data.metrics.rmse} />
                  <Metric label="MAPE" value={forecast.data.metrics.mape} suffix="%" />
                </div>
                <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted">
                  The 95% band is an approximate residual-based interval. Backtest metrics summarize errors on held-out recent months; lower values indicate closer historical forecasts.
                </p>
              </div>
            </details>
          </div>
        )}
      </StateWrapper>
    </div>
  );
}

export default function Forecasting() {
  return <Suspense><ForecastingInner /></Suspense>;
}
