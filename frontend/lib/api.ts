export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiUrl = (path: string) => `${API_BASE}/api${path}`;

export interface Point { year: number; month: string | null; value: number | null; unit: string; }
export interface Series { indicator: string; sex: string; period: string; data: Point[]; }
export interface Kpi { indicator_name: string; value: number | null; unit: string; reference_date: string | null; }
export interface AgeRow { year: number; month: string | null; age_group: string; value: number | null; unit: string; }
export interface AgeSex { source: string; data: AgeRow[]; }
export interface UnderSummary { rate: Series; by_age: AgeSex; }
export interface VisibleInvisible { visible: Point[]; invisible: Point[]; }
export interface CategoryRow { category: string; value: number | null; unit: string; year?: number; month?: string | null; }
export interface SectorResp { latest: CategoryRow[]; total_series: Point[]; }
export interface PayResp { latest: CategoryRow[]; }
