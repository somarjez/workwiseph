"use client";
import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

interface LogRow {
  id: number; job: string; status: string; detail: string | null;
  started_at: string | null; finished_at: string | null;
}

const field = "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";
const primaryBtn = "rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50";
const ghostBtn = "rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2";

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { setToken(localStorage.getItem("ww_admin_token")); }, []);

  const loadLogs = useCallback(async (tok: string) => {
    const r = await fetch(apiUrl("/admin/logs"), { headers: { Authorization: `Bearer ${tok}` } });
    if (r.ok) setLogs(await r.json());
    else if (r.status === 401) { setToken(null); localStorage.removeItem("ww_admin_token"); }
  }, []);

  useEffect(() => { if (token) loadLogs(token); }, [token, loadLogs]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const r = await fetch(apiUrl("/admin/login"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (r.ok) {
      const tok = (await r.json()).access_token;
      localStorage.setItem("ww_admin_token", tok); setToken(tok); setPassword("");
    } else {
      setMsg(r.status === 429 ? "Too many attempts — wait a few minutes." : "Invalid credentials.");
    }
  }

  async function runJob(path: string) {
    if (!token) return;
    setMsg(null);
    const r = await fetch(apiUrl(path), { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    setMsg(r.status === 202 ? "Job started — logs will update shortly." : `Failed (${r.status}).`);
    setTimeout(() => loadLogs(token), 1500);
  }

  async function uploadCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setMsg(null);
    const form = new FormData(); form.append("file", file);
    const r = await fetch(apiUrl("/admin/upload"), {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form,
    });
    const body = await r.json().catch(() => ({}));
    setMsg(r.ok ? `Uploaded ${body.rows} rows from ${body.filename}.` : `Upload failed: ${body.detail ?? r.status}`);
    e.target.value = "";
    setTimeout(() => loadLogs(token), 800);
  }

  function logout() { localStorage.removeItem("ww_admin_token"); setToken(null); setLogs([]); }

  if (!token) {
    return (
      <div className="mx-auto max-w-sm">
        <PageHeader title="Admin" context="Sign in to refresh data, regenerate forecasts, upload a dataset, or review run history." />
        <form onSubmit={login} className="space-y-3 rounded-xl border border-border bg-surface p-6">
          <input className={field} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className={field} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className={`${primaryBtn} w-full`}>Sign in</button>
          {msg && <p className="text-sm text-danger">{msg}</p>}
        </form>
      </div>
    );
  }

  const statusColor = (s: string) =>
    s === "success" ? "text-success" : s === "error" ? "text-danger" : "text-warning";

  return (
    <div>
      <PageHeader title="Admin" context="Trigger data refreshes and model regeneration, upload a CSV, and audit every run.">
        <button onClick={logout} className={ghostBtn}>Sign out</button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-3">
        <button onClick={() => runJob("/admin/etl/run")} className={primaryBtn}>Run ETL</button>
        <button onClick={() => runJob("/admin/forecast/run")} className={primaryBtn}>Regenerate forecasts</button>
        <label className={`${ghostBtn} cursor-pointer`}>
          Upload CSV
          <input type="file" accept=".csv" onChange={uploadCsv} className="hidden" />
        </label>
        <button onClick={() => token && loadLogs(token)} className={ghostBtn}>Refresh logs</button>
      </div>
      {msg && <p className="mb-4 text-sm text-muted">{msg}</p>}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">#</th>
              <th className="px-4 py-2.5 font-medium">Job</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Started</th>
              <th className="px-4 py-2.5 font-medium">Finished</th>
            </tr>
          </thead>
          <tbody className="nums">
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-border first:border-t-0">
                <td className="px-4 py-2.5 text-muted">{l.id}</td>
                <td className="px-4 py-2.5 text-ink">{l.job}</td>
                <td className={`px-4 py-2.5 font-medium ${statusColor(l.status)}`}>{l.status}</td>
                <td className="px-4 py-2.5 text-muted">{l.started_at?.replace("T", " ").slice(0, 19)}</td>
                <td className="px-4 py-2.5 text-muted">{l.finished_at?.replace("T", " ").slice(0, 19) ?? "—"}</td>
              </tr>
            ))}
            {!logs.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No runs yet. Trigger one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
