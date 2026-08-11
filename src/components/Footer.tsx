import React from "react";
import { useI18n } from "../i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line mt-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-ink-faint">
        <div className="flex flex-col gap-0.5">
          <span className="font-display font-semibold text-ink text-sm">SYJ PropertySync</span>
          <span>{t("footer.tagline")}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="badge bg-accent-soft text-accent-dark">{t("footer.poc")}</span>
          <span className="badge bg-canvas border border-line">{t("app.demoMode")}</span>
        </div>
        <div className="text-ink-faint">
          English · Suomi · Deutsch · Polski · Español · Português
        </div>
      </div>
    </footer>
  );
}
