import React from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { AlertCircle, ArrowRight, PlayCircle } from "lucide-react";
import { useI18n } from "../i18n";
import { useDemoStore } from "../services/demoStore";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge, toneForSyncStatus } from "../components/StatusBadge";

const perfData = [
  { day: "Mon", syncs: 142 },
  { day: "Tue", syncs: 158 },
  { day: "Wed", syncs: 131 },
  { day: "Thu", syncs: 176 },
  { day: "Fri", syncs: 164 },
  { day: "Sat", syncs: 97 },
  { day: "Sun", syncs: 88 },
];

export default function Dashboard() {
  const { t, formatCurrency, formatDateTime } = useI18n();
  const { properties, connectors, auditLog } = useDemoStore();

  const pending = properties.filter((p) => p.syncStatus === "pending").length;
  const failed = properties.filter((p) => p.syncStatus === "failed").length;
  const warning = properties.filter((p) => p.syncStatus === "warning").length;
  const synced = properties.filter((p) => p.syncStatus === "synced").length;
  const active = properties.filter((p) => p.status === "active").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{t("dashboard.title")}</h1>
          <p className="text-sm text-ink-faint mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <Link to="/welcome" className="btn-primary self-start">
          <PlayCircle size={16} />
          {t("dashboard.startDemo")}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label={t("kpi.totalProperties")} value="1,248" hint={t("common.demoData")} />
        <KpiCard label={t("kpi.activeListings")} value={String(186 + active - properties.length)} hint={t("common.demoData")} />
        <KpiCard label={t("kpi.pendingSync")} value={String(7 + pending)} tone={pending ? "warning" : "default"} />
        <KpiCard label={t("kpi.successfulToday")} value={String(179 + synced - properties.length)} tone="success" />
        <KpiCard label={t("kpi.failedToday")} value={String(3 + failed)} tone={failed ? "danger" : "default"} />
        <KpiCard label={t("kpi.validationIssues")} value={String(5 + warning)} tone={warning ? "warning" : "default"} />
        <KpiCard label={t("kpi.duplicateRecords")} value="2" hint={t("common.demoData")} />
        <KpiCard label={t("kpi.avgSyncTime")} value="2.4s" hint={t("common.demoData")} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 card p-4 sm:p-6">
          <h2 className="font-display font-semibold text-ink mb-4">{t("dashboard.syncPerformance")}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={perfData} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="#DEE3E1" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#5B6B78" }} axisLine={{ stroke: "#DEE3E1" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#5B6B78" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #DEE3E1", fontSize: 12 }}
                  labelStyle={{ color: "#14213A", fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="syncs" stroke="#1F6F78" strokeWidth={2.5} dot={{ r: 3, fill: "#1F6F78" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-ink-faint mt-2">{t("common.demoData")}</p>
        </div>

        <div className="card p-4 sm:p-6">
          <h2 className="font-display font-semibold text-ink mb-4">{t("dashboard.connectorStatus")}</h2>
          <div className="flex flex-col gap-3">
            {connectors.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-sm text-ink">{t(`connectors.${c.id}` as any)}</span>
                <StatusBadge
                  label={t(`connectors.status.${c.status}` as any)}
                  tone={c.status === "connected" ? "success" : c.status === "degraded" ? "warning" : "danger"}
                />
              </div>
            ))}
          </div>
          <Link to="/connectors" className="text-xs text-accent hover:text-accent-dark font-medium mt-4 inline-flex items-center gap-1">
            {t("dashboard.viewAll")} <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink">{t("dashboard.propertyActivity")}</h2>
            <Link to="/properties" className="text-xs text-accent hover:text-accent-dark font-medium">
              {t("dashboard.viewAll")}
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-line">
            {properties.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                to={`/properties/${p.id}`}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-canvas -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm text-ink font-medium truncate">{p.address}</div>
                  <div className="text-xs text-ink-faint font-mono">{p.id}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-ink-faint">{formatCurrency(p.monthlyRent)}</span>
                  <StatusBadge label={t(`syncStatus.${p.syncStatus}` as any)} tone={toneForSyncStatus(p.syncStatus)} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-danger" />
            {t("dashboard.recentActivity")}
          </h2>
          <div className="flex flex-col divide-y divide-line">
            {auditLog.slice(0, 5).map((entry) => (
              <div key={entry.id} className="py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-ink">{t(entry.action as any)}</span>
                  <StatusBadge
                    label={t(`audit.result.${entry.result}` as any)}
                    tone={entry.result === "success" ? "success" : "danger"}
                  />
                </div>
                <div className="text-xs text-ink-faint mt-0.5 font-mono">
                  {entry.propertyId} · {formatDateTime(entry.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
