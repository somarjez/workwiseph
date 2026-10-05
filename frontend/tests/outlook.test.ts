import { describe, expect, it } from "vitest";
import type { AnomalyResp, ForecastResp } from "@/lib/api";
import {
  defaultThreshold,
  deriveOutlook,
  normalizeHorizon,
  normalizeOption,
  normalizeThreshold,
} from "@/lib/outlook";

const forecast: ForecastResp = {
  indicator: "Unemployment Rate",
  history: [
    { reference_date: "2026-01-01", value: 5.2 },
    { reference_date: "2026-02-01", value: null },
    { reference_date: "2026-03-01", value: 5.0 },
  ],
  forecast: [
    { month: "2026-04-01", value: 5.05, lower: 4.7, upper: 5.4 },
    { month: "2026-05-01", value: 5.0, lower: 4.6, upper: 5.4 },
    { month: "2026-06-01", value: 5.1, lower: 4.8, upper: 5.4 },
    { month: "2026-07-01", value: 4.9, lower: 4.5, upper: 5.3 },
    { month: "2026-08-01", value: 4.8, lower: 4.4, upper: 5.2 },
    { month: "2026-09-01", value: 4.7, lower: 4.3, upper: 5.1 },
  ],
  metrics: { mae: 0.2, rmse: 0.3, mape: 4.1 },
};

const anomalies: AnomalyResp = {
  indicator: "Unemployment Rate",
  method: "zscore",
  points: Array.from({ length: 14 }, (_, index) => ({
    reference_date: index < 12
      ? `2025-${String(index + 1).padStart(2, "0")}-01`
      : `2026-${String(index - 11).padStart(2, "0")}-01`,
    value: 5 + index / 10,
    is_anomaly: index === 0 || index === 12,
  })),
};

describe("deriveOutlook", () => {
  it("uses the selected horizon and classifies a 0.1 point change as rising", () => {
    const result = deriveOutlook(forecast, 3, 5.0, anomalies);

    expect(result).toMatchObject({
      latestValue: 5.0,
      latestDate: "2026-03-01",
      targetMonth: "2026-06-01",
      targetValue: 5.1,
      change: 0.1,
      direction: "rising",
      thresholdStatus: "overlap",
      recentAnomalyCount: 1,
      latestAnomalyDate: "2026-01-01",
    });
  });

  it("classifies changes below 0.1 points as stable", () => {
    expect(deriveOutlook(forecast, 3, 6)?.direction).toBe("rising");
    const nearlyFlat = [...forecast.forecast];
    nearlyFlat[2] = { ...nearlyFlat[2], value: 5.05 };
    expect(deriveOutlook({ ...forecast, forecast: nearlyFlat }, 3, 6)?.direction)
      .toBe("stable");
  });

  it("uses strict confidence-band bounds for threshold status", () => {
    expect(deriveOutlook(forecast, 6, 4.2)?.thresholdStatus).toBe("above");
    expect(deriveOutlook(forecast, 6, 5.2)?.thresholdStatus).toBe("below");
    expect(deriveOutlook(forecast, 6, 4.3)?.thresholdStatus).toBe("overlap");
    expect(deriveOutlook(forecast, 6, 5.1)?.thresholdStatus).toBe("overlap");
  });

  it("returns null when no usable history or target forecast exists", () => {
    expect(deriveOutlook({ ...forecast, history: [] }, 3, 5)).toBeNull();
    expect(deriveOutlook({ ...forecast, forecast: [] }, 3, 5)).toBeNull();
  });
});

describe("outlook query normalization", () => {
  it("normalizes horizon, threshold, and supported string options", () => {
    expect(normalizeHorizon("3")).toBe(3);
    expect(normalizeHorizon("12")).toBe(6);
    expect(normalizeThreshold("4.7", 5)).toBe(4.7);
    expect(normalizeThreshold("", 5)).toBe(5);
    expect(normalizeThreshold("101", 5)).toBe(5);
    expect(normalizeOption("rf", ["ets", "rf"] as const, "ets")).toBe("rf");
    expect(normalizeOption("magic", ["ets", "rf"] as const, "ets")).toBe("ets");
  });

  it("rounds the latest usable observation for the default threshold", () => {
    expect(defaultThreshold(forecast)).toBe(5);
    expect(defaultThreshold({ ...forecast, history: [{ reference_date: "2026-01-01", value: 4.86 }] })).toBe(4.9);
  });
});
