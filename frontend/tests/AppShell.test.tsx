import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppShell from "@/components/AppShell";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

describe("AppShell", () => {
  beforeEach(() => { navigation.pathname = "/"; });

  it("renders the landing route without dashboard navigation", () => {
    render(<AppShell><div>Landing content</div></AppShell>);

    expect(screen.getByText("Landing content")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("keeps dashboard navigation on analysis routes", () => {
    navigation.pathname = "/overview";
    render(<AppShell><div>Overview content</div></AppShell>);

    expect(screen.getByText("Overview content")).toBeInTheDocument();
    expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0);
  });
});
