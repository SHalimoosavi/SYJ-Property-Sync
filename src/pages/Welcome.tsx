import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MousePointerClick,
  Pencil,
  Save,
  PlayCircle,
  Waypoints,
  ShieldCheck,
  Plug,
  History,
  BarChart3,
} from "lucide-react";
import { useI18n } from "../i18n";
import { useDemoStore } from "../services/demoStore";

const steps = [
  { key: "welcome.step1", icon: MousePointerClick },
  { key: "welcome.step2", icon: Pencil },
  { key: "welcome.step3", icon: Save },
  { key: "welcome.step4", icon: PlayCircle },
  { key: "welcome.step5", icon: Waypoints },
  { key: "welcome.step6", icon: ShieldCheck },
  { key: "welcome.step7", icon: Plug },
  { key: "welcome.step8", icon: History },
  { key: "welcome.step9", icon: BarChart3 },
] as const;

export default function Welcome() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { properties } = useDemoStore();
  const hero = properties.find((p) => p.id === "DEMO-TURKU-1042") ?? properties[0];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card overflow-hidden">
        <div className="bg-ink px-6 sm:px-10 py-10 sm:py-14 text-white relative">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" aria-hidden>
            <svg width="100%" height="100%">
              <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0V28" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="relative">
            <span className="badge bg-accent text-white mb-4">{t("app.demoMode")}</span>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight max-w-2xl">
              {t("welcome.title")}
            </h1>
            <p className="mt-3 text-white/70 max-w-xl text-[15px] leading-relaxed">
              {t("welcome.body")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/properties/${hero.id}`)}
                className="btn-primary px-5 py-3"
              >
                {t("welcome.cta")}
              </button>
              <button onClick={() => navigate("/")} className="btn px-5 py-3 text-white/80 hover:text-white">
                {t("welcome.skip")}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map(({ key, icon: Icon }, idx) => (
              <li key={key} className="flex gap-3 rounded-xl border border-line p-4">
                <div className="h-9 w-9 shrink-0 rounded-full bg-accent-soft text-accent-dark flex items-center justify-center font-mono text-xs font-semibold">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
                    <Icon size={15} className="text-accent" />
                    {t(`${key}.title` as any)}
                  </div>
                  <p className="text-xs text-ink-faint mt-1 leading-relaxed">
                    {t(`${key}.body` as any)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
