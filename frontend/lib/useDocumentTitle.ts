"use client";
import { useEffect } from "react";

// Client pages can't export Next metadata; set a per-page <title> at runtime.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} · WorkWise PH`;
    return () => { document.title = prev; };
  }, [title]);
}
