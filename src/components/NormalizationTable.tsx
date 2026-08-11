import React from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../i18n";
import { NormalizationChange } from "../types";

export function NormalizationTable({ changes }: { changes: NormalizationChange[] }) {
  const { t } = useI18n();
  if (changes.length === 0) return null;

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink-faint text-xs uppercase tracking-wide">
            <th className="font-medium px-1 py-2">{t("normalization.original")}</th>
            <th className="w-8" />
            <th className="font-medium px-1 py-2">{t("normalization.normalized")}</th>
            <th className="font-medium px-1 py-2">{t("normalization.rule")}</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c, i) => (
            <tr key={i} className="border-t border-line">
              <td className="px-1 py-2 font-mono text-xs text-ink-faint">{c.original}</td>
              <td className="px-1 py-2 text-ink-faint">
                <ArrowRight size={14} />
              </td>
              <td className="px-1 py-2 font-mono text-xs text-ink font-medium">{c.normalized}</td>
              <td className="px-1 py-2 text-xs text-ink-faint">{t(c.ruleKey as any)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
