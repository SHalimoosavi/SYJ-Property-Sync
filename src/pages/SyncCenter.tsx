import React, { useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { useI18n } from "../i18n";
import { useDemoStore } from "../services/demoStore";
import { SyncJob } from "../types";
import { StatusBadge, toneForJobStatus } from "../components/StatusBadge";

export default function SyncCenter() {
  const { t, formatDateTime } = useI18n();
  const { syncJobs, dispatch } = useDemoStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const selected = selectedId ? syncJobs.find((j) => j.id === selectedId) ?? null : null;

  function retry(job: SyncJob) {
    setRetryingId(job.id);
    dispatch({ type: "UPDATE_SYNC_JOB", jobId: job.id, patch: { status: "retrying" } });
    setTimeout(() => {
      const now = new Date().toISOString();
      dispatch({
        type: "UPDATE_SYNC_JOB",
        jobId: job.id,
        patch: {
          status: "completed",
          completedAt: now,
          durationMs: 640,
          responseSummary: `200 OK — record accepted (${t("sync.afterRetry").toLowerCase()})`,
          errorMessage: null,
        },
      });
      dispatch({
        type: "ADD_AUDIT_ENTRY",
        entry: {
          id: `AUD-${Date.now()}`,
          timestamp: now,
          actor: "Demo Admin",
          action: "audit.property_synced",
          propertyId: job.propertyId,
          previousValue: null,
          newValue: null,
          connector: job.connectorId,
          result: "success",
          correlationId: `corr-${Math.random().toString(16).slice(2, 8)}`,
        },
      });
      dispatch({ type: "SET_PROPERTY_SYNC_STATUS", propertyId: job.propertyId, status: "synced" });
      setRetryingId(null);
    }, 900);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{t("sync.title")}</h1>
        <p className="text-sm text-ink-faint mt-1">{t("sync.subtitle")}</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="font-medium px-4 py-3">{t("sync.job")}</th>
                <th className="font-medium px-4 py-3">{t("audit.property")}</th>
                <th className="font-medium px-4 py-3">{t("sync.connector")}</th>
                <th className="font-medium px-4 py-3 hidden md:table-cell">{t("sync.started")}</th>
                <th className="font-medium px-4 py-3 hidden lg:table-cell">{t("sync.duration")}</th>
                <th className="font-medium px-4 py-3">{t("common.status")}</th>
                <th className="font-medium px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {syncJobs.map((job) => (
                <tr key={job.id} className="border-t border-line hover:bg-canvas transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-ink-faint">{job.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-accent">{job.propertyId}</td>
                  <td className="px-4 py-3 text-ink">{t(`connectors.${job.connectorId}` as any)}</td>
                  <td className="px-4 py-3 text-ink-faint hidden md:table-cell">{formatDateTime(job.startedAt)}</td>
                  <td className="px-4 py-3 text-ink-faint font-mono hidden lg:table-cell">
                    {job.durationMs != null ? `${(job.durationMs / 1000).toFixed(1)}s` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={t(`sync.${job.status}` as any)}
                      tone={toneForJobStatus(job.status)}
                      pulse={job.status === "running" || job.status === "retrying"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {job.status === "failed" && (
                        <button
                          onClick={() => retry(job)}
                          disabled={retryingId === job.id}
                          className="btn-secondary py-1.5 px-3 text-xs"
                        >
                          <RefreshCw size={12} className={retryingId === job.id ? "animate-spin" : ""} />
                          {t("common.retry")}
                        </button>
                      )}
                      <button onClick={() => setSelectedId(job.id)} className="text-xs text-accent hover:text-accent-dark font-medium">
                        {t("common.viewDetails")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setSelectedId(null)} />
          <div className="relative w-full max-w-md bg-surface h-full shadow-popover p-6 overflow-y-auto animate-fadeUp">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-ink">{selected.id}</h2>
              <button onClick={() => setSelectedId(null)} className="text-ink-faint hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4 text-sm">
              <DetailRow label={t("audit.property")} value={selected.propertyId} mono />
              <DetailRow label={t("sync.connector")} value={t(`connectors.${selected.connectorId}` as any)} />
              <DetailRow label={t("sync.started")} value={formatDateTime(selected.startedAt)} />
              <DetailRow
                label={t("sync.completedAt")}
                value={selected.completedAt ? formatDateTime(selected.completedAt) : t("common.na")}
              />
              <DetailRow
                label={t("sync.duration")}
                value={selected.durationMs != null ? `${(selected.durationMs / 1000).toFixed(1)}s` : t("common.na")}
              />
              <DetailRow label={t("sync.payload")} value={selected.payloadSummary} mono />
              <DetailRow label={t("sync.response")} value={selected.responseSummary ?? t("common.na")} mono />
              {selected.errorMessage && (
                <div className="rounded-lg bg-danger-soft p-3 text-danger text-sm">
                  <div className="text-xs uppercase tracking-wide font-medium mb-1">{t("sync.error")}</div>
                  {selected.errorMessage}
                </div>
              )}
              <div>
                <StatusBadge label={t(`sync.${selected.status}` as any)} tone={toneForJobStatus(selected.status)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-ink-faint uppercase tracking-wide">{label}</div>
      <div className={`text-ink mt-0.5 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</div>
    </div>
  );
}
