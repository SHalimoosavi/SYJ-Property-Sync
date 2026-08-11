import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { LocaleCode } from "../types";
import en, { type TranslationKey } from "./locales/en";
import fi from "./locales/fi";
import de from "./locales/de";
import pl from "./locales/pl";
import es from "./locales/es";
import pt from "./locales/pt";

const dictionaries: Record<LocaleCode, Record<TranslationKey, string>> = {
  en,
  fi,
  de,
  pl,
  es,
  pt,
};

export const LANGUAGE_NAMES: Record<LocaleCode, string> = {
  en: "English",
  fi: "Suomi",
  de: "Deutsch",
  pl: "Polski",
  es: "Español",
  pt: "Português",
};

export const LOCALE_TAGS: Record<LocaleCode, string> = {
  en: "en-GB",
  fi: "fi-FI",
  de: "de-DE",
  pl: "pl-PL",
  es: "es-ES",
  pt: "pt-PT",
};

const STORAGE_KEY = "syj-propertysync-locale";
const DEFAULT_LOCALE: LocaleCode = "fi";

interface I18nContextValue {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (iso: string) => string;
  formatDateTime: (iso: string) => string;
  formatNumber: (n: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && stored in dictionaries) return stored as LocaleCode;
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(readStoredLocale);

  const setLocale = useCallback((next: LocaleCode) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const dict = dictionaries[locale] ?? en;
      let str = dict[key] ?? en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [locale]
  );

  const formatCurrency = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(LOCALE_TAGS[locale], {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(amount),
    [locale]
  );

  const formatDate = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(new Date(iso)),
    [locale]
  );

  const formatDateTime = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso)),
    [locale]
  );

  const formatNumber = useCallback(
    (n: number) => new Intl.NumberFormat(LOCALE_TAGS[locale]).format(n),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, formatCurrency, formatDate, formatDateTime, formatNumber }),
    [locale, setLocale, t, formatCurrency, formatDate, formatDateTime, formatNumber]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
