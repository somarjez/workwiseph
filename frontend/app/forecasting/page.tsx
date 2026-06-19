"use client";
import { useState } from "react";
import { useApi } from "@/lib/useApi";
import type { ForecastResp } from "@/lib/api";
import ForecastChart from "@/components/ForecastChart";
import StateWrapper from "@/components/StateWrapper";

const INDICATORS = [
  "Unemployment Rate", "Underemployment Rate",
  "Employment Rate", "Labor Force Participation Rate",
];

function Metric({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-2xl font-bold text-slate-900">{value == null ? "—" : value.toFixed(2)}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}

export default function Forecasting() {
  const [indicator, setIndicator] = useState(INDICATORS[0]);
  const { data, error, isLoading } = useApi<ForecastResp>(
    `/forecast?indicator=${encodeURIComponent(indicator)}`);

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Forecasting</h2>
      <p className="mb-4 text-sm text-slate-500">
        Holt-Winters, 6-month horizon. Trained on monthly data (2021–present).
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        {INDICATORS.map((ind) => (
          <button key={ind} onClick={() => setIndicator(ind)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              ind === indicator ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}>
            {ind}
          </button>
        ))}
      </div>
      <StateWrapper isLoading={isLoading} error={error} isEmpty={!data?.history.length}>
        {data && (
          <>
            <div className="mb-6 grid grid-cols-3 gap-4 sm:max-w-md">
              <Metric label="MAE" value={data.metrics.mae} />
              <Metric label="RMSE" value={data.metrics.rmse} />
              <Metric label="MAPE %" value={data.metrics.mape} />
            </div>
            <ForecastChart data={data} label={`${indicator}: actual vs forecast`} />
          </>
        )}
      </StateWrapper>
    </div>
  );
}
