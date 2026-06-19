"use client";
import useSWR from "swr";
import { apiUrl } from "./api";

const fetcher = async (path: string) => {
  const res = await fetch(apiUrl(path));
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
};

export function useApi<T>(path: string | null) {
  const { data, error, isLoading } = useSWR<T>(path, fetcher);
  return { data, error: error as Error | undefined, isLoading };
}
