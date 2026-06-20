# EDA Findings

Exploratory findings from `clean.fact_long` (PSA Labor Force Survey, 2005–2026).
Figures are computed directly from the loaded database; the queries are in
`data_pipeline/notebooks/EDA_REPORT.ipynb`. Rates are percent; counts are in thousands.

## Which years had the highest unemployment?

The clear peak is **2020 (≈10.4% annual average)** — the COVID-19 labor shock — far above
any other year. The next-highest are **2006 (≈8.0%)** and **2021 (≈7.8%)**, the latter the
tail of the pandemic. Outside 2020–2021, unemployment has trended down toward ~4–5%.

## Which years had the highest underemployment?

Underemployment was highest in the **mid-2000s (2005 ≈22.6%, 2006 ≈22.6%, 2007 ≈20.1%)**
and has **declined substantially** since, running in the mid-teens in recent years. This is
the project's headline story: fewer workers are stuck in too-few-hours / low-pay work than
two decades ago, though the level is still material.

## Is there a male–female participation gap?

Yes, and it is large and persistent. Average **labor-force participation is ≈76% for men
versus ≈51% for women** — a ~25-point gap that holds across the whole period. The "Compare"
view on the Age & Gender and Overview pages makes this gap visible directly.

## Which age group has the highest unemployment?

**Young workers (15–24), followed by 25–34.** In the latest year the 15–24 band carries the
most unemployed persons of any age group, consistent with youth being the most vulnerable
to joblessness — the older bands (45+) carry far fewer.

## Which industries employ the most workers?

**Services dominate.** The Services major group employs ~30.5M, more than Agriculture
(~9.5M) and Industry (~8.9M) combined. Within sub-sectors, **wholesale & retail trade** is
the single largest employer (~9.7M), underlining a services-led labor market.

## Does more education mean less underemployment?

Not monotonically. Underemployment **share** by education is elevated both at the low end
(no grade / elementary, ~20%) and, notably, among some mid-level groups (e.g. post-secondary
undergraduate, ~29% in the latest snapshot). Higher attainment reduces *unemployment* but
does not cleanly eliminate *underemployment*, hinting at skills–jobs mismatch.

## Has the work week changed?

Mean hours worked has been roughly flat-to-slightly-down: around **42 hours/week in 2005**
drifting to roughly **40 hours/week** in recent readings — a modest decline rather than a
sharp shift.

---

*Method:* annual figures are averages of the monthly/quarterly observations for `Both Sexes`
unless noted; "latest" uses the most recent reference date with data. Pre-2021 data is
quarterly, so early-year averages rest on fewer observations.
