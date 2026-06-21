"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import CommandPalette from "./CommandPalette";

function openCommand() {
  window.dispatchEvent(new Event("ww:command"));
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  // Close the mobile drawer on navigation.
  useEffect(() => { setOpen(false); }, [path]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen md:block print:!hidden">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} aria-hidden />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden print:!hidden">
          <button onClick={() => setOpen(true)} aria-label="Open navigation menu"
            className="rounded-md p-1.5 text-ink transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="font-display text-lg font-semibold tracking-tight">WorkWise PH</span>
          <button onClick={openCommand} aria-label="Search"
            className="ml-auto rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </header>

        <main className="flex-1 px-5 py-7 sm:px-6 sm:py-8 md:px-10 md:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
