"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

// Read/write a single filter value in the URL querystring (replace, no scroll).
// The fallback value is kept OUT of the URL so default views stay clean.
export function useQueryState<T extends string>(key: string, fallback: T): [T, (v: T) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const value = (params.get(key) as T | null) ?? fallback;

  const setValue = useCallback((v: T) => {
    const next = new URLSearchParams(params.toString());
    if (v === fallback) next.delete(key);
    else next.set(key, v);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [key, fallback, params, router, pathname]);

  return [value, setValue];
}
