export interface Cmd { label: string; href: string; group: string; }

export const COMMANDS: Cmd[] = [
  { label: "Home", href: "/", group: "Pages" },
  { label: "Overview", href: "/overview", group: "Pages" },
  { label: "Underemployment", href: "/underemployment", group: "Pages" },
  { label: "Age & Gender", href: "/age-gender", group: "Pages" },
  { label: "Industry & Occupation", href: "/industry", group: "Pages" },
  { label: "Education", href: "/education", group: "Pages" },
  { label: "Workforce", href: "/workforce", group: "Pages" },
  { label: "Forecasting", href: "/forecasting", group: "Pages" },
  { label: "Data Explorer", href: "/explore", group: "Pages" },
  { label: "Report (printable)", href: "/report", group: "Pages" },
  { label: "Admin", href: "/admin", group: "Pages" },
  // Indicator deep-links into the forecasting view
  { label: "Forecast: Unemployment Rate", href: "/forecasting?indicator=Unemployment%20Rate", group: "Forecasts" },
  { label: "Forecast: Underemployment Rate", href: "/forecasting?indicator=Underemployment%20Rate", group: "Forecasts" },
  { label: "Forecast: Employment Rate", href: "/forecasting?indicator=Employment%20Rate", group: "Forecasts" },
  { label: "Forecast: Labor Force Participation Rate", href: "/forecasting?indicator=Labor%20Force%20Participation%20Rate", group: "Forecasts" },
  // Compare-by-sex deep links
  { label: "Compare male vs female: underemployment", href: "/underemployment?sex=compare", group: "Compare" },
  { label: "Compare male vs female: age & gender", href: "/age-gender?sex=compare", group: "Compare" },
];

export function filterCommands(query: string, commands: Cmd[] = COMMANDS): Cmd[] {
  const q = query.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter(
    (c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
}
