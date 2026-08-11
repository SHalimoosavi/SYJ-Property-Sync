import { Database, Globe, Building, Mail, Webhook, FileSpreadsheet, Code2, type LucideIcon } from "lucide-react";
import { useI18n } from "../i18n";
import { useDemoStore } from "../services/demoStore";
import { StatusBadge } from "../components/StatusBadge";
import { ConnectorId } from "../types";

const ICONS: Record<ConnectorId, LucideIcon> = {
  crm: Database,
  website: Globe,
  portal: Building,
  email: Mail,
  webhook: Webhook,
  csv: FileSpreadsheet,
  api: Code2,
};

export default function Connectors() {
  const { t, formatDateTime } = useI18n();
  const { connectors } = useDemoStore();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{t("connectors.title")}</h1>
        <p className="text-sm text-ink-faint mt-1">{t("connectors.subtitle")}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((c) => {
          const Icon = ICONS[c.id];
          const tone = c.status === "connected" ? "success" : c.status === "degraded" ? "warning" : "danger";
          return (
            <div key={c.id} className="card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent-soft text-accent-dark flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-ink text-sm">{t(`connectors.${c.id}` as any)}</div>
                    <div className="text-[11px] text-ink-faint">{t("connectors.simulatedLabel")}</div>
                  </div>
                </div>
                <StatusBadge label={t(`connectors.status.${c.status}` as any)} tone={tone} />
              </div>

              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-ink-faint uppercase tracking-wide">{t("connectors.lastSync")}</dt>
                  <dd className="text-ink mt-0.5">{c.lastSync ? formatDateTime(c.lastSync) : t("common.na")}</dd>
                </div>
                <div>
                  <dt className="text-ink-faint uppercase tracking-wide">{t("connectors.recordsSynced")}</dt>
                  <dd className="text-ink mt-0.5 font-mono">{c.recordsSynced.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-ink-faint uppercase tracking-wide">{t("connectors.latency")}</dt>
                  <dd className="text-ink mt-0.5 font-mono">{c.latencyMs}ms</dd>
                </div>
                <div>
                  <dt className="text-ink-faint uppercase tracking-wide">{t("connectors.successRate")}</dt>
                  <dd className="text-ink mt-0.5 font-mono">{c.successRate}%</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}
