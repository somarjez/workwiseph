"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/underemployment", label: "Underemployment" },
  { href: "/age-gender", label: "Age & Gender" },
  { href: "/industry", label: "Industry & Occupation" },
  { href: "/education", label: "Education" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-slate-100 min-h-screen p-5">
      <h1 className="text-xl font-bold mb-1">WorkWise PH</h1>
      <p className="text-xs text-slate-400 mb-6">Labor Market Analytics</p>
      <nav className="flex flex-col gap-1">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href}
            className={`rounded px-3 py-2 text-sm ${
              path === n.href ? "bg-slate-700 font-semibold" : "hover:bg-slate-800"
            }`}>
            {n.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
