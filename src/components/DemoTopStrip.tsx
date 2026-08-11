import React, { useState } from "react";
import { useI18n } from "../i18n";
import { useDemoStore } from "../services/demoStore";

export function DemoTopStrip() {
  const { t } = useI18n();
  const { dispatch } = useDemoStore();
  const [confirming, setConfirming] = useState(false);
  const [justReset, setJustReset] = useState(false);

  function handleReset() {
    dispatch({ type: "RESET_DEMO" });
    setConfirming(false);
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2500);
  }

  return (
    <div className="w-full bg-ink text-white/90 text-xs">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge bg-accent text-white font-semibold tracking-wide">
            {t("app.demoMode")}
          </span>
          <span className="text-white/70">{t("app.preparedFor")} — {t("app.demoEnvironment")}</span>
        </div>
        <div className="flex items-center gap-2">
          {justReset && <span className="text-accent font-medium">{t("app.resetDemo.done")}</span>}
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-white/70">{t("app.resetDemo.confirm")}</span>
              <button onClick={handleReset} className="underline decoration-accent underline-offset-2 hover:text-white">
                {t("common.save")}
              </button>
              <button onClick={() => setConfirming(false)} className="text-white/50 hover:text-white/80">
                {t("common.cancel")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="hover:text-white transition-colors underline decoration-white/30 underline-offset-2"
            >
              {t("app.resetDemo")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
