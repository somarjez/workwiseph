import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import KpiCard from "@/components/KpiCard";

describe("KpiCard", () => {
  it("formats a percent value", () => {
    render(<KpiCard label="Unemployment Rate" value={4.706} unit="percent" />);
    expect(screen.getByText("4.7%")).toBeInTheDocument();
  });

  it("formats a level (thousands) as millions", () => {
    render(<KpiCard label="Employed Persons" value={48889.464} unit="persons" />);
    expect(screen.getByText("48.9M")).toBeInTheDocument();
  });

  it("renders an em dash when value is null", () => {
    render(<KpiCard label="x" value={null} unit="percent" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows an upward YoY delta in percentage points for rates", () => {
    render(<KpiCard label="Unemployment Rate" value={4.7} unit="percent" previous={4.0} />);
    const delta = screen.getByText(/0\.7 pp/);
    expect(delta).toBeInTheDocument();
    expect(delta.textContent).toContain("▲");
  });

  it("shows a downward delta when the value fell", () => {
    render(<KpiCard label="Employment Rate" value={95.0} unit="percent" previous={96.0} />);
    const delta = screen.getByText(/1\.0 pp/);
    expect(delta.textContent).toContain("▼");
  });

  it("omits the delta when there is no previous value", () => {
    render(<KpiCard label="x" value={10} unit="percent" />);
    expect(screen.queryByText(/pp/)).not.toBeInTheDocument();
  });
});
