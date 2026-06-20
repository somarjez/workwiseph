import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PillGroup from "@/components/PillGroup";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("PillGroup", () => {
  it("renders every option label", () => {
    render(<PillGroup options={OPTIONS} value="a" onChange={() => {}} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("marks the active option with aria-pressed", () => {
    render(<PillGroup options={OPTIONS} value="b" onChange={() => {}} />);
    expect(screen.getByText("Beta")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Alpha")).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with the option value when clicked", () => {
    const onChange = vi.fn();
    render(<PillGroup options={OPTIONS} value="a" onChange={onChange} />);
    fireEvent.click(screen.getByText("Beta"));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
