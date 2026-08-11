import React, { useState } from "react";
import { Check } from "lucide-react";
import { LANGUAGE_NAMES, useI18n } from "../i18n";
import { useDemoStore } from "../services/demoStore";
import type { LocaleCode } from "../types";

const ORDER: LocaleCode[] = ["fi", "en", "de", "pl", "es", "pt"];

const BENEFIT_KEYS = [
  "benefits.item.manualEntry",
  "benefits.item.errors",
  "benefits.item.centralized",
  "benefits.item.faster",
  "benefits.item.consistency",
  "benefits.item.auditability",
  "benefits.item.multilingual",
  "benefits.item.visibility",
] as const;

export default function Settings() {
  const { t, locale, setLocale } = useI18n();
  const { dispatch } = useDemoStore();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  function resetDemo() {
    dispatch({ type: "RESET_DEMO" });
    setConfirming(false);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{t("settings.title")}</h1>
        <p className="text-sm text-ink-faint mt-1">{t("settings.subtitle")}</p>
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold text-ink mb-1">{t("settings.language")}</h2>
        <p className="text-xs text-ink-faint mb-4">{t("app.subtitle")}</p>
        <div className="flex flex-wrap gap-2">
          {ORDER.map((code) => (
            <button
              key={code}
              onClick={() => setLocale(code)}
              className={`badge border transition-colors px-3 py-1.5 ${
                locale === code ? "bg-accent text-white border-accent" : "bg-surface border-line text-ink hover:bg-canvas"
              }`}
            >
              {locale === code && <Check size={12} strokeWidth={3} />}
              {LANGUAGE_NAMES[code]}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold text-ink mb-3">{t("settings.organization")}</h2>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-ink-faint uppercase tracking-wide">{t("settings.organization")}</dt>
            <dd className="text-ink mt-0.5">{t("settings.organization.name")}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint uppercase tracking-wide">{t("common.city")}</dt>
            <dd className="text-ink mt-0.5">{t("settings.organization.location")}</dd>
          </div>
        </dl>
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold text-ink mb-1">{t("settings.demoData")}</h2>
        <p className="text-sm text-ink-faint mb-4">{t("settings.demoData.body")}</p>
        {done && <p className="text-sm text-success font-medium mb-3">{t("app.resetDemo.done")}</p>}
        {confirming ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink-faint">{t("app.resetDemo.confirm")}</span>
            <button onClick={resetDemo} className="btn-primary py-1.5 px-3 text-xs">
              {t("app.resetDemo")}
            </button>
            <button onClick={() => setConfirming(false)} className="btn-ghost py-1.5 px-3 text-xs">
              {t("common.cancel")}
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="btn-secondary">
            {t("app.resetDemo")}
          </button>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold text-ink mb-1">{t("settings.about")}</h2>
        <p className="text-sm text-ink-faint leading-relaxed">{t("settings.about.body")}</p>
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold text-ink mb-1">{t("benefits.title")}</h2>
        <p className="text-xs text-ink-faint mb-4">{t("benefits.disclaimer")}</p>
        <ul className="grid sm:grid-cols-2 gap-2.5">
          {BENEFIT_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-2 text-sm text-ink">
              <span className="h-5 w-5 rounded-full bg-success-soft text-success flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </span>
              {t(key as any)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
