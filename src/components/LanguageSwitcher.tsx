import React, { useEffect, useRef, useState } from "react";
import { LANGUAGE_NAMES, useI18n } from "../i18n";
import type { LocaleCode } from "../types";

const ORDER: LocaleCode[] = ["fi", "en", "de", "pl", "es", "pt"];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-canvas transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <GlobeIcon />
        <span>{LANGUAGE_NAMES[locale]}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-44 rounded-lg border border-line bg-surface shadow-popover py-1 z-50 animate-fadeUp"
        >
          {ORDER.map((code) => (
            <button
              key={code}
              role="option"
              aria-selected={code === locale}
              onClick={() => {
                setLocale(code);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-canvas transition-colors flex items-center justify-between ${
                code === locale ? "text-accent font-medium" : "text-ink"
              }`}
            >
              {LANGUAGE_NAMES[code]}
              {code === locale && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 6 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-6-3.8-9s1.3-6.3 3.8-9z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
