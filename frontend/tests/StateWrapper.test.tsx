import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StateWrapper from "@/components/StateWrapper";

describe("StateWrapper", () => {
  it("shows a busy skeleton while loading", () => {
    const { container } = render(
      <StateWrapper isLoading={true}><div>content</div></StateWrapper>);
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("shows the error message on error", () => {
    render(<StateWrapper isLoading={false} error={new Error("boom")}><div>content</div></StateWrapper>);
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it("shows an empty state when isEmpty", () => {
    render(<StateWrapper isLoading={false} isEmpty={true}><div>content</div></StateWrapper>);
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it("renders children when loaded with data", () => {
    render(<StateWrapper isLoading={false}><div>content</div></StateWrapper>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
