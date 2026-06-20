"use client";

export interface Option<T extends string> { value: T; label: string; }

export default function PillGroup<T extends string>({
  label, options, value, onChange,
}: {
  label?: string;
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-xs font-medium text-muted">{label}</span>}
      <div role="group" aria-label={label} className="flex gap-0.5 rounded-lg border border-border bg-surface p-0.5">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button key={o.value} onClick={() => onChange(o.value)} aria-pressed={active}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${
                active ? "bg-accent text-white" : "text-muted hover:text-ink"
              }`}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
