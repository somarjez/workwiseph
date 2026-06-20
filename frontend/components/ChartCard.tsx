"use client";
import { useRef } from "react";
import { downloadCSV, downloadSvgAsPng } from "@/lib/export";

export default function ChartCard({
  title, csvData, children,
}: {
  title: string;
  csvData?: Record<string, unknown>[];
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  function png() {
    const svg = ref.current?.querySelector("svg");
    if (svg) downloadSvgAsPng(svg as SVGSVGElement, `${base}.png`);
  }

  return (
    <div ref={ref}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <div className="flex gap-2 text-xs text-slate-400">
          {csvData && csvData.length > 0 && (
            <button onClick={() => downloadCSV(csvData, `${base}.csv`)}
              className="hover:text-blue-600" title="Download data as CSV">CSV</button>
          )}
          <button onClick={png} className="hover:text-blue-600" title="Download chart as PNG">PNG</button>
        </div>
      </div>
      {children}
    </div>
  );
}
