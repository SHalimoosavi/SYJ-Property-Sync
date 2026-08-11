import React from "react";

export function KpiCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const valueTone =
    tone === "success"
      ? "text-success"
      : tone === "warning"
      ? "text-warning"
      : tone === "danger"
      ? "text-danger"
      : "text-ink";

  return (
    <div className="card p-4 sm:p-5 flex flex-col gap-1.5 min-w-0">
      <span className="text-xs font-medium text-ink-faint uppercase tracking-wide truncate">
        {label}
      </span>
      <span className={`font-display text-2xl sm:text-[28px] font-semibold leading-none ${valueTone}`}>
        {value}
      </span>
      {hint && <span className="text-xs text-ink-faint">{hint}</span>}
    </div>
  );
}
