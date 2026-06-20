// Concrete colors (not CSS vars) so serialized PNG exports keep their colors,
// chosen to read on both light and dark surfaces.
export const CHART = {
  accent: "#3457d5",   // primary series / bars / forecast
  neutral: "#64748b",  // secondary series (e.g. actuals) — legible on both themes
  grid: "#94a3b8",     // hairline grid (used with low strokeOpacity)
  tick: "#94a3b8",     // axis tick labels
  band: "#3457d5",     // forecast confidence band (used with low fillOpacity)
};
