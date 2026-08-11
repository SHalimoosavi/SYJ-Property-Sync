import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import { useDemoStore } from "../services/demoStore";
import { validateProperty, validationSummary } from "../services/engine";
import { ValidationList } from "../components/ValidationList";
import { KpiCard } from "../components/KpiCard";

export default function ValidationCenter() {
  const { t } = useI18n();
  const { properties } = useDemoStore();
  const [expandedId, setExpandedId] = useState<string | null>(properties[0]?.id ?? null);

  const rows = useMemo(
    () => properties.map((p) => ({ property: p, results: validateProperty(p) })),
    [properties]
  );

  const totals = useMemo(() => {
    let errors = 0;
    let warnings = 0;
    let passed = 0;
    rows.forEach(({ results }) => {
      const s = validationSummary(results);
      errors += s.errors;
      warnings += s.warnings;
      passed += s.passed;
    });
    return { errors, warnings, passed };
  }, [rows]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{t("validation.title")}</h1>
        <p className="text-sm text-ink-faint mt-1">{t("validation.subtitle")}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <KpiCard label={t("validation.pass")} value={String(totals.passed)} tone="success" />
        <KpiCard label={t("validation.warning")} value={String(totals.warnings)} tone="warning" />
        <KpiCard label={t("validation.error")} value={String(totals.errors)} tone="danger" />
      </div>

      <div className="flex flex-col gap-3">
        {rows.map(({ property, results }) => {
          const s = validationSummary(results);
          const isOpen = expandedId === property.id;
          return (
            <div key={property.id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedId(isOpen ? null : property.id)}
                className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-canvas transition-colors text-left"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{property.address}</div>
                  <div className="text-xs text-ink-faint font-mono">{property.id}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs">
                  {s.errors > 0 && <span className="badge bg-danger-soft text-danger">{s.errors} {t("validation.error")}</span>}
                  {s.warnings > 0 && <span className="badge bg-warning-soft text-warning">{s.warnings} {t("validation.warning")}</span>}
                  {s.errors === 0 && s.warnings === 0 && (
                    <span className="badge bg-success-soft text-success">{t("validation.pass")}</span>
                  )}
                </div>
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 pt-1 border-t border-line">
                  <ValidationList results={results} />
                  {(s.errors > 0 || s.warnings > 0) && (
                    <Link
                      to={`/properties/${property.id}`}
                      className="inline-block mt-3 text-xs text-accent hover:text-accent-dark font-medium"
                    >
                      {t("validation.fixInline")}
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
