"use client";
import Link from "next/link";
import { useApi } from "@/lib/useApi";
import type { Kpi } from "@/lib/api";
import KpiCard from "@/components/KpiCard";

const SECTIONS = [
  { href: "/overview", title: "Overview", desc: "Headline employment, unemployment, and participation rates." },
  { href: "/underemployment", title: "Underemployment", desc: "Visible vs invisible underemployment, by age and sex." },
  { href: "/age-gender", title: "Age & Gender", desc: "Labor-force gaps across age groups and between sexes." },
  { href: "/industry", title: "Industry & Occupation", desc: "Sector employment shifts and pay by industry." },
  { href: "/education", title: "Education", desc: "Employment and underemployment by attainment." },
  { href: "/workforce", title: "Workforce", desc: "Class of worker, hours worked, and the mean work week." },
  { href: "/forecasting", title: "Forecasting", desc: "Six-month projections with confidence bands." },
];

export default function Home() {
  const kpis = useApi<Kpi[]>("/kpis");
  const percents = kpis.data?.filter((k) => k.unit === "percent") ?? [];

  return (
    <div className="animate-rise">
      <section className="border-b border-border pb-12 pt-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Philippine Labor Force Survey · 2005–2026
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-tight text-balance md:text-6xl">
          Two decades of Philippine labor data, read closely.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
          WorkWise PH turns the Philippine Statistics Authority&rsquo;s Labor Force Survey into an
          interactive report on employment, underemployment, industry, education, pay, working
          hours, and short-term forecasts.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/overview"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
            Open the overview
          </Link>
          <Link href="/underemployment"
            className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2">
            Underemployment deep dive
          </Link>
        </div>
      </section>

      {percents.length > 0 && (
        <section className="border-b border-border py-10">
          <h2 className="mb-4 text-sm font-semibold text-ink">Latest indicators</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {percents.map((k) => (
              <KpiCard key={k.indicator_name} label={k.indicator_name} value={k.value} unit={k.unit} />
            ))}
          </div>
        </section>
      )}

      <section className="py-10">
        <h2 className="mb-2 font-display text-2xl font-medium tracking-tight">Explore the report</h2>
        <p className="mb-6 max-w-2xl text-sm text-muted">Seven views, each answering a specific question about the Philippine labor market.</p>
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.href} className="border-b border-border">
              <Link href={s.href} className="group flex items-baseline justify-between gap-4 py-4">
                <span>
                  <span className="font-display text-lg font-medium text-ink transition-colors group-hover:text-accent">
                    {s.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{s.desc}</span>
                </span>
                <span aria-hidden className="text-muted transition-all group-hover:translate-x-0.5 group-hover:text-accent">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
