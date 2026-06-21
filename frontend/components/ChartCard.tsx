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

  const btn = "rounded px-1.5 py-0.5 transition-colors hover:bg-accent-weak hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

  return (
    <figure ref={ref} className="rounded-xl border border-border bg-surface p-5">
      <figcaption className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-ink">{title}</h3>
        <div className="flex shrink-0 gap-1 text-[11px] font-medium text-muted print:hidden">
          {csvData && csvData.length > 0 && (
            <button onClick={() => downloadCSV(csvData, `${base}.csv`)} className={btn}
              title="Download data as CSV">CSV</button>
          )}
          <button onClick={png} className={btn} title="Download chart as PNG">PNG</button>
        </div>
      </figcaption>
      {children}
    </figure>
  );
}
