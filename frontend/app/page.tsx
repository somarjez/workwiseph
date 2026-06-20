"use client";
import Link from "next/link";
import { useApi } from "@/lib/useApi";
import type { Kpi } from "@/lib/api";
import KpiCard from "@/components/KpiCard";

const SECTIONS = [
  { href: "/overview", title: "Overview", desc: "Headline employment, unemployment & participation rates." },
  { href: "/underemployment", title: "Underemployment", desc: "The project's focus: visible vs invisible, by age & sex." },
  { href: "/age-gender", title: "Age & Gender", desc: "Labor-force gaps across age groups and sexes." },
  { href: "/industry", title: "Industry & Occupation", desc: "Sector employment shifts and pay by industry." },
  { href: "/education", title: "Education", desc: "Employment & underemployment by educational attainment." },
  { href: "/workforce", title: "Workforce", desc: "Class of worker, hours worked, and weekly mean hours." },
  { href: "/forecasting", title: "Forecasting", desc: "6-month Holt-Winters forecasts with confidence bands." },
];

export default function Home() {
  const kpis = useApi<Kpi[]>("/kpis");

  return (
    <div>
      <section className="mb-10 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 p-10 text-white shadow">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-200">WorkWise PH</p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
          Philippine Labor Market &amp; Underemployment Analytics
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-200">
          An end-to-end analytics platform that turns PSA Labor Force Survey tables (2005–2026)
          into interactive insight on employment, underemployment, industry, education, pay, and
          working hours — with statistical forecasting and anomaly detection.
        </p>
        <Link href="/overview"
          className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100">
          Explore the dashboard →
        </Link>
      </section>

      {kpis.data && kpis.data.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Latest indicators
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {kpis.data.filter((k) => k.unit === "percent").map((k) => (
              <KpiCard key={k.indicator_name} label={k.indicator_name} value={k.value} unit={k.unit} />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow dark:border-slate-700 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{s.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
