import type { AnomalyResp, ForecastResp } from "./api";

export type Horizon = 3 | 6;
export type OutlookDirection = "rising" | "falling" | "stable";
export type ThresholdStatus = "above" | "below" | "overlap";

export interface Outlook {
  latestValue: number;
  latestDate: string;
  targetMonth: string;
  targetValue: number;
  intervalLower: number;
  intervalUpper: number;
  change: number;
  direction: OutlookDirection;
  thresholdStatus: ThresholdStatus;
  recentAnomalyCount: number;
  latestAnomalyDate: string | null;
}

const round = (value: number, digits = 4) => Number(value.toFixed(digits));

export function normalizeHorizon(value: string | null | undefined): Horizon {
  return value === "3" ? 3 : 6;
}

export function normalizeThreshold(
  value: string | null | undefined,
  fallback: number,
): number {
  if (value == null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : fallback;
}

export function normalizeOption<const T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return value != null && allowed.includes(value as T) ? value as T : fallback;
}

export function defaultThreshold(data: ForecastResp): number {
  const latest = [...data.history].reverse().find((point) => point.value != null);
  return latest?.value == null ? 0 : round(latest.value, 1);
}

export function deriveOutlook(
  data: ForecastResp,
  horizon: Horizon,
  threshold: number,
  anomalies?: AnomalyResp | null,
): Outlook | null {
  const latest = [...data.history].reverse().find((point) => point.value != null);
  const target = data.forecast[horizon - 1];
  if (latest?.value == null || !target) return null;

  const change = round(target.value - latest.value);
  const direction: OutlookDirection = Math.abs(change) < 0.1
    ? "stable"
    : change > 0 ? "rising" : "falling";
  const thresholdStatus: ThresholdStatus = target.lower > threshold
    ? "above"
    : target.upper < threshold ? "below" : "overlap";
  const recentAnomalies = (anomalies?.points ?? []).slice(-12).filter((point) => point.is_anomaly);

  return {
    latestValue: latest.value,
    latestDate: latest.reference_date,
    targetMonth: target.month,
    targetValue: target.value,
    intervalLower: target.lower,
    intervalUpper: target.upper,
    change,
    direction,
    thresholdStatus,
    recentAnomalyCount: recentAnomalies.length,
    latestAnomalyDate: recentAnomalies.at(-1)?.reference_date ?? null,
  };
}
