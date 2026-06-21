"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/overview", label: "Overview" },
  { href: "/underemployment", label: "Underemployment" },
  { href: "/age-gender", label: "Age & Gender" },
  { href: "/industry", label: "Industry & Occupation" },
  { href: "/education", label: "Education" },
  { href: "/workforce", label: "Workforce" },
  { href: "/forecasting", label: "Forecasting" },
  { href: "/explore", label: "Data Explorer" },
  { href: "/report", label: "Report" },
  { href: "/admin", label: "Admin" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="flex h-full min-h-screen w-60 shrink-0 flex-col border-r border-border bg-surface-2 px-4 py-6 md:min-h-0">
      <Link href="/" className="block px-2 focus-visible:outline-none">
        <span className="font-display text-xl font-semibold tracking-tight text-ink">WorkWise PH</span>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-muted">Labor Analytics</p>
      </Link>
      <button onClick={() => window.dispatchEvent(new Event("ww:command"))}
        className="mt-6 flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-xs text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <span>Search…</span>
        <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
      </button>
      <nav className="mt-4 flex flex-1 flex-col gap-0.5">
        {NAV.map((n) => {
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-weak font-medium text-accent"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}>
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border pt-2">
        <ThemeToggle />
      </div>
    </aside>
  );
}
