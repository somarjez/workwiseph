import { describe, it, expect } from "vitest";
import { COMMANDS, filterCommands } from "@/lib/commands";

describe("filterCommands", () => {
  it("returns all commands for an empty query", () => {
    expect(filterCommands("")).toHaveLength(COMMANDS.length);
    expect(filterCommands("   ")).toHaveLength(COMMANDS.length);
  });

  it("matches on label, case-insensitively", () => {
    const r = filterCommands("UNDEREMPLOY");
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((c) => /underemploy/i.test(c.label))).toBe(true);
  });

  it("matches on group (e.g. Forecasts)", () => {
    const r = filterCommands("forecast");
    expect(r.some((c) => c.group === "Forecasts")).toBe(true);
  });

  it("returns nothing for a non-match", () => {
    expect(filterCommands("zzzznope")).toHaveLength(0);
  });

  it("every command points at a route path", () => {
    expect(COMMANDS.every((c) => c.href.startsWith("/"))).toBe(true);
  });
});
