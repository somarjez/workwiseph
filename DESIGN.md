# Design

Editorial data-journalism for a product dashboard. Light-default with a dark toggle.

## Color (OKLCH)

Restrained: ink-on-paper neutrals + one accent. Tokens live in `frontend/app/globals.css`.

**Light**
- `--bg` oklch(0.985 0.003 250) — cool near-white "paper" (chroma ~0, not cream)
- `--surface` oklch(1 0 0) — white panels/cards
- `--border` oklch(0.92 0.004 250)
- `--ink` oklch(0.24 0.012 264) — near-black body/headings
- `--muted` oklch(0.47 0.01 264) — secondary text (≥4.5:1 on bg)
- `--accent` oklch(0.48 0.13 256) — deep editorial blue; actions, active state, primary series
- `--accent-weak` oklch(0.93 0.04 256) — accent tint for bands/hover

**Dark** (`.dark`)
- `--bg` oklch(0.19 0.012 264) · `--surface` oklch(0.235 0.012 264) · `--border` oklch(0.32 0.012 264)
- `--ink` oklch(0.96 0 0) · `--muted` oklch(0.72 0.01 264) · `--accent` oklch(0.7 0.13 256)

Semantic: success oklch(0.55 0.13 150), warning oklch(0.7 0.13 75), danger oklch(0.55 0.18 25).

## Typography

- **Display (serif):** Newsreader — page titles (h1/h2), the landing hero, large section heads. Editorial voice. Never on labels, buttons, table cells, axis ticks, or KPI numerals.
- **Body / UI (sans):** Inter — everything functional, data, labels, numerals (tabular-nums for figures).
- Fixed rem scale (product): title 1.75–2rem, hero up to ~3.25rem, section 1.25rem, body 0.875–1rem. Weight contrast over size noise. `text-wrap: balance` on headings.

## Components

- **PageHeader:** serif title + one-line context sentence + a hairline rule. Consistent on every page (no per-section uppercase eyebrows).
- **Cards/panels:** `--surface`, 1px `--border`, radius 0.75rem, very soft shadow; no nested cards, no side-stripe borders.
- **KPI:** large tabular-nums figure (sans) + small muted label + optional delta; restrained, not the gradient hero-metric template.
- **Charts (Recharts):** muted hairline grid, `--muted` axis ticks, `--accent` primary series, ink secondary; CSV/PNG export affordance per chart.
- **Controls:** pill toggles + buttons share one vocabulary; default/hover/focus/active/disabled all styled; visible focus ring in accent.
- **States:** skeleton shimmer for loading, teaching empty states, honest errors.

## Motion

150–250ms ease-out. A subtle content fade/rise on mount (staggered for KPI rows only), state transitions on hover/active/theme. No page-load choreography. Full `prefers-reduced-motion: reduce` fallback (instant/!important).

## Layout

Sidebar (cooler neutral panel) + content. Fixed rem type; responsive is structural (sidebar collapses, grids reflow via `auto-fit minmax`). Content max-width for prose; data grids may run dense.
