"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { COMMANDS, filterCommands } from "@/lib/commands";

export default function CommandPalette() {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => filterCommands(query, COMMANDS), [query]);
  useEffect(() => { setActive(0); }, [query]);

  function open() { setQuery(""); setActive(0); ref.current?.showModal(); }
  function close() { ref.current?.close(); }
  function go(href: string) { close(); router.push(href); }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (ref.current?.open) close(); else open();
      }
    };
    const onEvt = () => open();
    window.addEventListener("keydown", onKey);
    window.addEventListener("ww:command", onEvt);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ww:command", onEvt);
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[active]; if (r) go(r.href); }
  }

  return (
    <dialog ref={ref} onClick={(e) => { if (e.target === ref.current) close(); }}
      className="m-auto mt-24 w-[min(36rem,92vw)] rounded-xl border border-border bg-surface p-0 text-ink shadow-2xl">
      <div onKeyDown={onKeyDown}>
        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages, indicators, comparisons…"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted" />
        <ul className="max-h-80 overflow-auto py-1">
          {results.map((r, i) => (
            <li key={r.href + r.label}>
              <button onMouseEnter={() => setActive(i)} onClick={() => go(r.href)}
                className={`flex w-full items-center justify-between gap-4 px-4 py-2 text-left text-sm ${
                  i === active ? "bg-accent-weak text-accent" : "text-ink"
                }`}>
                <span>{r.label}</span>
                <span className="shrink-0 text-xs text-muted">{r.group}</span>
              </button>
            </li>
          ))}
          {!results.length && <li className="px-4 py-6 text-center text-sm text-muted">No matches.</li>}
        </ul>
      </div>
    </dialog>
  );
}
