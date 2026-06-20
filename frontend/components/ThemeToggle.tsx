"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ww_theme", next ? "dark" : "light");
  }

  return (
    <button onClick={toggle}
      className="mt-6 w-full rounded px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800"
      aria-label="Toggle dark mode">
      {dark ? "☀️ Light mode" : "🌙 Dark mode"}
    </button>
  );
}
