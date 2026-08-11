import React from "react";
import { Check, X, AlertTriangle, Loader2, Circle } from "lucide-react";
import { useI18n } from "../i18n";
import { PipelineStage, StageStatus } from "../types";

const STAGE_ICON_TONE: Record<StageStatus, string> = {
  pending: "text-pending bg-pending-soft border-line",
  running: "text-accent bg-accent-soft border-accent/30",
  completed: "text-success bg-success-soft border-success/30",
  warning: "text-warning bg-warning-soft border-warning/30",
  failed: "text-danger bg-danger-soft border-danger/30",
};

function StageIcon({ status }: { status: StageStatus }) {
  const cls = "h-4 w-4";
  switch (status) {
    case "completed":
      return <Check className={cls} strokeWidth={2.5} />;
    case "running":
      return <Loader2 className={`${cls} animate-spin`} strokeWidth={2.5} />;
    case "warning":
      return <AlertTriangle className={cls} strokeWidth={2.5} />;
    case "failed":
      return <X className={cls} strokeWidth={2.5} />;
    case "pending":
    default:
      return <Circle className={cls} strokeWidth={2} />;
  }
}

export function PipelineVisualizer({ stages }: { stages: PipelineStage[] }) {
  const { t } = useI18n();
  const completedCount = stages.filter((s) => s.status === "completed" || s.status === "warning").length;
  const progressPct = (completedCount / stages.length) * 100;
  const hasFailed = stages.some((s) => s.status === "failed");

  return (
    <div className="w-full">
      {/* Desktop: horizontal stepper */}
      <div className="hidden md:block">
        <div className="relative">
          <div className="absolute left-0 right-0 top-5 h-[3px] bg-line rounded-full" />
          <div
            className={`absolute left-0 top-5 h-[3px] rounded-full transition-all duration-500 ease-out ${
              hasFailed ? "bg-danger" : "bg-accent"
            }`}
            style={{ width: `${progressPct}%` }}
          />
          <div className="relative grid" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
            {stages.map((stage) => (
              <div key={stage.id} className="flex flex-col items-center gap-2 px-1">
                <div
                  className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${STAGE_ICON_TONE[stage.status]}`}
                >
                  <StageIcon status={stage.status} />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-medium text-ink leading-tight">
                    {t(`pipeline.stage.${stage.id}` as any)}
                  </div>
                  <div className="text-[10px] text-ink-faint font-mono mt-0.5 h-3.5">
                    {stage.durationMs != null ? `${(stage.durationMs / 1000).toFixed(1)}s` : "\u00A0"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {stages.some((s) => s.status === "failed" && s.message) && (
          <div className="mt-4 text-xs text-danger text-center font-medium">
            {t(stages.find((s) => s.status === "failed")?.message as any)}
          </div>
        )}
      </div>

      {/* Mobile: vertical list */}
      <div className="md:hidden flex flex-col gap-0">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${STAGE_ICON_TONE[stage.status]}`}
              >
                <StageIcon status={stage.status} />
              </div>
              {idx < stages.length - 1 && (
                <div
                  className={`w-[2px] flex-1 min-h-[18px] ${
                    stage.status === "completed" || stage.status === "warning"
                      ? hasFailed
                        ? "bg-danger"
                        : "bg-accent"
                      : "bg-line"
                  }`}
                />
              )}
            </div>
            <div className="pb-4 pt-1">
              <div className="text-sm font-medium text-ink">
                {t(`pipeline.stage.${stage.id}` as any)}
              </div>
              <div className="text-xs text-ink-faint font-mono">
                {stage.durationMs != null ? `${(stage.durationMs / 1000).toFixed(1)}s` : t(`pipeline.status.${stage.status}` as any)}
              </div>
              {stage.message && (
                <div className="text-xs text-danger mt-0.5">{t(stage.message as any)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
