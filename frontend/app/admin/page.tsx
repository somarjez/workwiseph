"use client";
import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "@/lib/api";

interface LogRow {
  id: number; job: string; status: string; detail: string | null;
  started_at: string | null; finished_at: string | null;
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("ww_admin_token"));
  }, []);

  const loadLogs = useCallback(async (tok: string) => {
    const r = await fetch(apiUrl("/admin/logs"), {
      headers: { Authorization: `Bearer ${tok}` },
    });
    if (r.ok) setLogs(await r.json());
    else if (r.status === 401) { setToken(null); localStorage.removeItem("ww_admin_token"); }
  }, []);

  useEffect(() => { if (token) loadLogs(token); }, [token, loadLogs]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const r = await fetch(apiUrl("/admin/login"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (r.ok) {
      const tok = (await r.json()).access_token;
      localStorage.setItem("ww_admin_token", tok);
      setToken(tok); setPassword("");
    } else {
      setMsg(r.status === 429 ? "Too many attempts — wait a few minutes." : "Invalid credentials.");
    }
  }

  async function runJob(path: string) {
    if (!token) return;
    setMsg(null);
    const r = await fetch(apiUrl(path), { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    setMsg(r.status === 202 ? "Job started — refresh logs in a moment." : `Failed (${r.status}).`);
    setTimeout(() => loadLogs(token), 1500);
  }

  function logout() {
    localStorage.removeItem("ww_admin_token"); setToken(null); setLogs([]);
  }

  if (!token) {
    return (
      <div className="max-w-sm">
        <h2 className="mb-6 text-2xl font-bold">Admin Login</h2>
        <form onSubmit={login} className="space-y-3">
          <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Sign in</button>
          {msg && <p className="text-sm text-red-600">{msg}</p>}
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin</h2>
        <button onClick={logout} className="text-sm text-slate-500 underline">Sign out</button>
      </div>
      <div className="mb-4 flex gap-3">
        <button onClick={() => runJob("/admin/etl/run")}
          className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white">Run ETL</button>
        <button onClick={() => runJob("/admin/forecast/run")}
          className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white">Regenerate forecasts</button>
        {token && <button onClick={() => loadLogs(token)}
          className="rounded border border-slate-300 px-4 py-2 text-sm">Refresh logs</button>}
      </div>
      {msg && <p className="mb-4 text-sm text-slate-600">{msg}</p>}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-2">#</th><th className="px-4 py-2">Job</th>
              <th className="px-4 py-2">Status</th><th className="px-4 py-2">Started</th>
              <th className="px-4 py-2">Finished</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{l.id}</td>
                <td className="px-4 py-2">{l.job}</td>
                <td className="px-4 py-2">
                  <span className={l.status === "success" ? "text-green-600"
                    : l.status === "error" ? "text-red-600" : "text-amber-600"}>{l.status}</span>
                </td>
                <td className="px-4 py-2 text-slate-500">{l.started_at?.replace("T", " ").slice(0, 19)}</td>
                <td className="px-4 py-2 text-slate-500">{l.finished_at?.replace("T", " ").slice(0, 19) ?? "—"}</td>
              </tr>
            ))}
            {!logs.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No runs yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
