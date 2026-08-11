import React from "react";

type Tone = "success" | "warning" | "danger" | "pending" | "accent" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  pending: "bg-pending-soft text-ink-faint",
  accent: "bg-accent-soft text-accent-dark",
  neutral: "bg-canvas text-ink-faint border border-line",
};

const dotClasses: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  pending: "bg-pending",
  accent: "bg-accent",
  neutral: "bg-ink-faint",
};

export function StatusBadge({
  label,
  tone,
  pulse = false,
}: {
  label: string;
  tone: Tone;
  pulse?: boolean;
}) {
  return (
    <span className={`badge ${toneClasses[tone]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]} ${pulse ? "animate-pulseRing" : ""}`}
      />
      {label}
    </span>
  );
}

export function toneForSyncStatus(status: string): Tone {
  switch (status) {
    case "synced":
      return "success";
    case "pending":
      return "pending";
    case "syncing":
      return "accent";
    case "failed":
      return "danger";
    case "warning":
      return "warning";
    default:
      return "neutral";
  }
}

export function toneForStageStatus(status: string): Tone {
  switch (status) {
    case "completed":
      return "success";
    case "running":
      return "accent";
    case "failed":
      return "danger";
    case "warning":
      return "warning";
    case "pending":
    default:
      return "pending";
  }
}

export function toneForJobStatus(status: string): Tone {
  switch (status) {
    case "completed":
      return "success";
    case "running":
      return "accent";
    case "failed":
      return "danger";
    case "retrying":
      return "warning";
    case "queued":
    default:
      return "pending";
  }
}
