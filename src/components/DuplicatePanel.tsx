import React, { useState } from "react";
import { useI18n } from "../i18n";
import { DuplicateCandidate } from "../types";

export function DuplicatePanel({ candidates }: { candidates: DuplicateCandidate[] }) {
  const { t } = useI18n();
  const [resolved, setResolved] = useState<Record<string, "merged" | "ignored">>({});

  if (candidates.length === 0) {
    return <p className="text-sm text-ink-faint">{t("duplicate.none")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {candidates.map((c) => {
        const key = c.comparedTo;
        const status = resolved[key];
        return (
          <div key={key} className="rounded-lg border border-warning/30 bg-warning-soft p-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="text-sm font-medium text-ink">{t("duplicate.potential")}</div>
                <div className="text-xs text-ink-faint">{t("duplicate.comparedTo", { id: c.comparedTo })}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-ink-faint">{t("duplicate.confidence")}</div>
                <div className="font-display font-semibold text-warning">{c.confidence}%</div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.matchedFields.map((f) => (
                <span key={f} className="badge bg-surface border border-line text-ink-faint">
                  {f}
                </span>
              ))}
            </div>
            {status ? (
              <div className="mt-3 text-xs font-medium text-ink-faint">
                {status === "merged" ? t("common.merge") : t("common.ignore")} ✓
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setResolved((r) => ({ ...r, [key]: "merged" }))}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  {t("common.merge")}
                </button>
                <button
                  onClick={() => setResolved((r) => ({ ...r, [key]: "ignored" }))}
                  className="btn-ghost py-1.5 px-3 text-xs"
                >
                  {t("common.ignore")}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
