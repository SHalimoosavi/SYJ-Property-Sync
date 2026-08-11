import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useI18n } from "../i18n";
import { useDemoStore } from "../services/demoStore";
import { StatusBadge } from "../components/StatusBadge";

export default function AuditLog() {
  const { t, formatDateTime } = useI18n();
  const { auditLog } = useDemoStore();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return auditLog;
    return auditLog.filter(
      (e) =>
        e.propertyId.toLowerCase().includes(q) ||
        e.correlationId.toLowerCase().includes(q) ||
        t(e.action as any).toLowerCase().includes(q)
    );
  }, [auditLog, query, t]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{t("audit.title")}</h1>
        <p className="text-sm text-ink-faint mt-1">{t("audit.subtitle")}</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("audit.searchPlaceholder")}
          className="input pl-9 max-w-md"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="font-medium px-4 py-3">{t("audit.timestamp")}</th>
                <th className="font-medium px-4 py-3">{t("audit.property")}</th>
                <th className="font-medium px-4 py-3">{t("audit.action")}</th>
                <th className="font-medium px-4 py-3 hidden md:table-cell">{t("audit.previousValue")}</th>
                <th className="font-medium px-4 py-3 hidden md:table-cell">{t("audit.newValue")}</th>
                <th className="font-medium px-4 py-3 hidden lg:table-cell">{t("audit.connector")}</th>
                <th className="font-medium px-4 py-3">{t("audit.result")}</th>
                <th className="font-medium px-4 py-3 hidden lg:table-cell">{t("audit.correlationId")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-line hover:bg-canvas transition-colors">
                  <td className="px-4 py-3 text-ink-faint whitespace-nowrap">{formatDateTime(e.timestamp)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-accent">{e.propertyId}</td>
                  <td className="px-4 py-3 text-ink">{t(e.action as any)}</td>
                  <td className="px-4 py-3 text-ink-faint font-mono text-xs hidden md:table-cell">{e.previousValue ?? "—"}</td>
                  <td className="px-4 py-3 text-ink font-mono text-xs hidden md:table-cell">{e.newValue ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-faint hidden lg:table-cell">
                    {e.connector === "system" ? "System" : t(`connectors.${e.connector}` as any)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={t(`audit.result.${e.result}` as any)}
                      tone={e.result === "success" ? "success" : "danger"}
                    />
                  </td>
                  <td className="px-4 py-3 text-ink-faint font-mono text-xs hidden lg:table-cell">{e.correlationId}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-faint">
                    {t("properties.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
