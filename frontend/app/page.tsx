"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useApi } from "@/lib/useApi";
import type { ForecastResp, Kpi } from "@/lib/api";
import { defaultThreshold, deriveOutlook } from "@/lib/outlook";

const ANALYSIS = [
  { href: "/overview", title: "Labor overview", desc: "Headline rates and long-run context." },
  { href: "/underemployment", title: "Underemployment", desc: "Visible and invisible underemployment by age and sex." },
  { href: "/industry", title: "Industry & occupation", desc: "Employment shifts, occupations, and pay." },
  { href: "/explore", title: "Data Explorer", desc: "Build and download a view from the full PSA series." },
];

const formatMonth = (iso: string) => new Intl.DateTimeFormat("en-PH", {
  month: "long", year: "numeric", timeZone: "UTC",
}).format(new Date(iso));

export default function Home() {
  const kpis = useApi<Kpi[]>("/kpis");
  const forecast = useApi<ForecastResp>("/forecast?indicator=Unemployment%20Rate&method=ets");
  const outlook = forecast.data
    ? deriveOutlook(forecast.data, 6, defaultThreshold(forecast.data))
    : null;
  const unemployment = kpis.data?.find((k) => k.indicator_name === "Unemployment Rate");

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4 sm:px-8">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">WorkWise PH</Link>
          <nav aria-label="Public navigation" className="ml-auto hidden items-center gap-5 text-sm text-muted sm:flex">
            <Link href="/forecasting" className="hover:text-ink">Outlook</Link>
            <Link href="/overview" className="hover:text-ink">Analysis</Link>
            <Link href="/explore" className="hover:text-ink">Explore data</Link>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main>
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div className="animate-rise">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Philippine Labor Force Survey · 2005–2026
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-5xl font-medium leading-[0.98] tracking-tight text-balance md:text-7xl">
                Read the labor market forward, not just backward.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
                Build a six-month outlook for the Philippines&rsquo; headline labor rates. See the projected direction,
                uncertainty, unusual months, and whether a threshold is credibly in range.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/forecasting" className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                  Build an outlook
                </Link>
                <Link href="/overview" className="rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold hover:bg-surface-2">
                  Review the evidence
                </Link>
              </div>
            </div>

            <aside className="rounded-2xl border border-border bg-surface p-6 shadow-sm" aria-label="Live unemployment outlook">
              <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Live outlook</p>
                  <h2 className="mt-1 font-display text-2xl font-medium">Unemployment rate</h2>
                </div>
                <span className="rounded-full bg-accent-weak px-3 py-1 text-xs font-semibold text-accent">6 months</span>
              </div>
              {forecast.isLoading || kpis.isLoading ? (
                <div className="mt-6 h-40 rounded-xl skeleton" aria-label="Loading live outlook" />
              ) : outlook ? (
                <div className="mt-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted">Latest observed</p>
                      <p className="nums mt-1 text-3xl font-semibold">{unemployment?.value?.toFixed(1) ?? outlook.latestValue.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Forecast for {formatMonth(outlook.targetMonth)}</p>
                      <p className="nums mt-1 text-3xl font-semibold text-accent">{outlook.targetValue.toFixed(1)}%</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">
                    The model points {outlook.direction}, with a 95% range of {outlook.intervalLower.toFixed(1)}–{outlook.intervalUpper.toFixed(1)}%.
                  </p>
                  <Link href="/forecasting" className="inline-flex text-sm font-semibold text-accent hover:underline">
                    Test your own threshold →
                  </Link>
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted">The live preview is unavailable. The historical analysis remains accessible.</p>
              )}
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">From forecast to finding</p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight">A question-led way to read the next six months.</h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
            {[
              ["01", "Choose the signal", "Start with unemployment, underemployment, employment, or labor-force participation."],
              ["02", "Set a threshold", "Ask whether the forecast range sits above, below, or across a level that matters to your work."],
              ["03", "Take the evidence", "Share or print the result with uncertainty, anomalies, and backtest error kept visible."],
            ].map(([n, title, desc]) => (
              <article key={n} className="bg-surface p-6">
                <p className="nums text-xs font-semibold text-accent">{n}</p>
                <h3 className="mt-6 font-display text-xl font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface-2">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Supporting analysis</p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-tight">Trace the outlook back to the data.</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">Every forecast sits beside the historical tables and breakdowns used to understand its context.</p>
            </div>
            <div className="grid gap-x-8 sm:grid-cols-2">
              {ANALYSIS.map((item) => (
                <Link key={item.href} href={item.href} className="group border-b border-border py-4">
                  <span className="font-display text-lg font-medium group-hover:text-accent">{item.title}</span>
                  <span className="mt-1 block text-sm text-muted">{item.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="grid gap-8 rounded-2xl border border-border bg-surface p-7 md:grid-cols-[0.7fr_1.3fr] md:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Creator</p>
              <h2 className="mt-3 font-display text-3xl font-medium">Jezreel Ramos</h2>
              <p className="mt-2 text-sm text-muted">Data analyst & developer · Philippines</p>
            </div>
            <div>
              <p className="max-w-2xl leading-relaxed text-muted">
                WorkWise PH was created by Jezreel Ramos, a fourth-year BS Computer Science student majoring in Intelligent Systems.
                His work brings together data analysis, web development, project management, and AI/machine learning to turn complex information into clear, working software.
              </p>
              <p className="mt-4 text-sm text-muted">Python · SQL · TypeScript · React · Next.js · FastAPI · Scikit-learn</p>
              <div className="mt-6 flex gap-4 text-sm font-semibold">
                <a href="https://github.com/somarjez" target="_blank" rel="noreferrer" className="text-accent hover:underline">GitHub ↗</a>
                <a href="mailto:jezreelramoz@gmail.com" className="text-accent hover:underline">Email Jezreel</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>WorkWise PH · PSA Labor Force Survey analytics and short-term forecasts.</p>
          <p>Created by Jezreel Ramos · © 2026</p>
        </div>
      </footer>
    </div>
  );
}
