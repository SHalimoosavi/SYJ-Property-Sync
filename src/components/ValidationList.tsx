import React from "react";
import { Check, AlertTriangle, X } from "lucide-react";
import { useI18n } from "../i18n";
import { ValidationResult } from "../types";

export function ValidationList({ results }: { results: ValidationResult[] }) {
  const { t } = useI18n();
  if (results.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1.5">
      {results.map((r, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm">
          <span
            className={`mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center ${
              r.severity === "pass"
                ? "bg-success-soft text-success"
                : r.severity === "warning"
                ? "bg-warning-soft text-warning"
                : "bg-danger-soft text-danger"
            }`}
          >
            {r.severity === "pass" && <Check size={11} strokeWidth={3} />}
            {r.severity === "warning" && <AlertTriangle size={11} strokeWidth={3} />}
            {r.severity === "error" && <X size={11} strokeWidth={3} />}
          </span>
          <span className="text-ink">
            {r.severity === "pass"
              ? t("validation.msg.ok", { field: t(`validation.field.${r.field}` as any) })
              : t(r.messageKey as any, r.messageParams)}
          </span>
        </li>
      ))}
    </ul>
  );
}
