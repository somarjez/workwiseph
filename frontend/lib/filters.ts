import type { Option } from "@/components/PillGroup";

export type Sex = "Both Sexes" | "Male" | "Female";
export type Range = "all" | "10" | "5";

export const SEX_OPTIONS: Option<Sex>[] = [
  { value: "Both Sexes", label: "All" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

// Adds a "Compare" mode that overlays Male and Female on one chart.
export type SexFilter = Sex | "compare";
export const SEX_FILTER_OPTIONS: Option<SexFilter>[] = [
  { value: "Both Sexes", label: "All" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "compare", label: "Compare" },
];

export const RANGE_OPTIONS: Option<Range>[] = [
  { value: "all", label: "All" },
  { value: "10", label: "10Y" },
  { value: "5", label: "5Y" },
];

export const rangeYears = (r: Range): number | undefined =>
  r === "all" ? undefined : Number(r);
