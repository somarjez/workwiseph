import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  replace: vi.fn(),
  params: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => h.params.current,
  useRouter: () => ({ replace: h.replace }),
  usePathname: () => "/overview",
}));

import { useQueryState } from "@/lib/useQueryState";

describe("useQueryState", () => {
  beforeEach(() => {
    h.replace.mockClear();
    h.params.current = new URLSearchParams();
  });

  it("returns the fallback when the key is absent", () => {
    const { result } = renderHook(() => useQueryState("sex", "Both Sexes"));
    expect(result.current[0]).toBe("Both Sexes");
  });

  it("reads an existing value from the querystring", () => {
    h.params.current = new URLSearchParams("sex=Male");
    const { result } = renderHook(() => useQueryState("sex", "Both Sexes"));
    expect(result.current[0]).toBe("Male");
  });

  it("writes a non-default value into the URL", () => {
    const { result } = renderHook(() => useQueryState("sex", "Both Sexes"));
    act(() => result.current[1]("Male"));
    expect(h.replace).toHaveBeenCalledWith("/overview?sex=Male", { scroll: false });
  });

  it("removes the key (clean URL) when set back to the fallback", () => {
    h.params.current = new URLSearchParams("sex=Male");
    const { result } = renderHook(() => useQueryState("sex", "Both Sexes"));
    act(() => result.current[1]("Both Sexes"));
    expect(h.replace).toHaveBeenCalledWith("/overview", { scroll: false });
  });
});
