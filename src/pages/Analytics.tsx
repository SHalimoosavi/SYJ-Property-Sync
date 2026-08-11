import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useI18n } from "../i18n";
import { useDemoStore } from "../services/demoStore";
import { validateProperty } from "../services/engine";

const RANGE_DAYS: Record<string, { day: string; syncs: number; failures: number }[]> = {
  today: [{ day: "Today", syncs: 24, failures: 1 }],
  "7d": [
    { day: "Mon", syncs: 142, failures: 4 },
    { day: "Tue", syncs: 158, failures: 2 },
    { day: "Wed", syncs: 131, failures: 6 },
    { day: "Thu", syncs: 176, failures: 3 },
    { day: "Fri", syncs: 164, failures: 5 },
    { day: "Sat", syncs: 97, failures: 1 },
    { day: "Sun", syncs: 88, failures: 2 },
  ],
  "30d": Array.from({ length: 10 }).map((_, i) => ({
    day: `W${i + 1}`,
    syncs: 700 + Math.round(Math.sin(i) * 120 + i * 15),
    failures: 8 + (i % 4),
  })),
};

export default function Analytics() {
  const { t } = useI18n();
  const { properties, connectors, auditLog } = useDemoStore();
  const [range, setRange] = useState<"today" | "7d" | "30d">("7d");

  const data = RANGE_DAYS[range];
  const totalSuccess = data.reduce((sum, d) => sum + d.syncs, 0);
  const totalFail = data.reduce((sum, d) => sum + d.failures, 0);

  const connectorPerf = connectors.map((c) => ({ name: t(`connectors.${c.id}` as any), rate: c.successRate }));

  const validationErrors = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach((p) => {
      validateProperty(p).forEach((r) => {
        if (r.severity !== "pass") {
          counts[r.field] = (counts[r.field] ?? 0) + 1;
        }
      });
    });
    return Object.entries(counts).map(([field, count]) => ({ field, count }));
  }, [properties]);

  const mostActive = [...properties]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{t("analytics.title")}</h1>
          <p className="text-sm text-ink-faint mt-1">{t("analytics.subtitle")}</p>
        </div>
        <div className="flex gap-1.5">
          {(["today", "7d", "30d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`btn-secondary py-1.5 px-3 text-xs ${range === r ? "!bg-accent !text-white !border-accent" : ""}`}
            >
              {r === "today" ? t("common.today") : r === "7d" ? t("common.days7") : t("common.days30")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-4">{t("analytics.syncsPerDay")}</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="#DEE3E1" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#5B6B78" }} axisLine={{ stroke: "#DEE3E1" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5B6B78" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #DEE3E1", fontSize: 12 }} />
                <Line type="monotone" dataKey="syncs" stroke="#1F6F78" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-4">{t("analytics.successVsFailure")}</h2>
          <div className="h-56 flex items-center justify-center gap-10">
            <StatBlock label={t("analytics.success")} value={totalSuccess} tone="success" />
            <StatBlock label={t("analytics.failure")} value={totalFail} tone="danger" />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-4">{t("analytics.connectorPerformance")}</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={connectorPerf} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="#DEE3E1" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#5B6B78" }} axisLine={{ stroke: "#DEE3E1" }} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: "#5B6B78" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #DEE3E1", fontSize: 12 }} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {connectorPerf.map((entry, i) => (
                    <Cell key={i} fill={entry.rate > 97 ? "#1E8E5A" : "#B9770E"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-4">{t("analytics.validationErrors")}</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={validationErrors} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="#DEE3E1" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="field" tick={{ fontSize: 10, fill: "#5B6B78" }} axisLine={{ stroke: "#DEE3E1" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5B6B78" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #DEE3E1", fontSize: 12 }} />
                <Bar dataKey="count" fill="#B9770E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display font-semibold text-ink mb-4">{t("analytics.mostActive")}</h2>
        <div className="flex flex-col divide-y divide-line">
          {mostActive.map((p) => (
            <div key={p.id} className="py-2.5 flex items-center justify-between text-sm">
              <span className="text-ink">{p.address}</span>
              <span className="text-ink-faint font-mono text-xs">{p.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, tone }: { label: string; value: number; tone: "success" | "danger" }) {
  return (
    <div className="text-center">
      <div className={`font-display text-4xl font-semibold ${tone === "success" ? "text-success" : "text-danger"}`}>
        {value}
      </div>
      <div className="text-xs text-ink-faint mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}
