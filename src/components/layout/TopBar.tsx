import React from "react";
import { Menu } from "lucide-react";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useI18n } from "../../i18n";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-line">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-ink-faint hover:text-ink -ml-1 p-1"
            aria-label={t("nav.openMenu")}
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <LogoMark />
            <div className="min-w-0 leading-tight">
              <div className="font-display font-semibold text-ink text-[15px] truncate">
                {t("app.name")}
              </div>
              <div className="text-[11px] text-ink-faint truncate hidden sm:block">
                {t("app.subtitle")}
              </div>
            </div>
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" className="shrink-0">
      <rect width="32" height="32" rx="7" fill="#14213A" />
      <path
        d="M9 21 L16 9 L23 21"
        stroke="#1F6F78"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="9" r="1.6" fill="#1F6F78" />
      <circle cx="9" cy="21" r="1.6" fill="#1F6F78" />
      <circle cx="23" cy="21" r="1.6" fill="#1F6F78" />
    </svg>
  );
}
