import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  RefreshCw,
  ShieldCheck,
  Plug,
  History,
  BarChart3,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useI18n } from "../../i18n";

const items = [
  { to: "/", icon: LayoutDashboard, key: "nav.dashboard" as const, end: true },
  { to: "/properties", icon: Building2, key: "nav.properties" as const },
  { to: "/sync-center", icon: RefreshCw, key: "nav.syncCenter" as const },
  { to: "/validation", icon: ShieldCheck, key: "nav.validation" as const },
  { to: "/connectors", icon: Plug, key: "nav.connectors" as const },
  { to: "/audit-log", icon: History, key: "nav.auditLog" as const },
  { to: "/analytics", icon: BarChart3, key: "nav.analytics" as const },
  { to: "/settings", icon: Settings, key: "nav.settings" as const },
];

export function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();

  return (
    <nav className="flex flex-col gap-0.5 p-3">
      <NavLink
        to="/welcome"
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium mb-2 transition-colors ${
            isActive ? "bg-accent text-white" : "bg-accent-soft text-accent-dark hover:bg-accent/20"
          }`
        }
      >
        <Sparkles size={17} />
        {t("nav.welcome")}
      </NavLink>
      {items.map(({ to, icon: Icon, key, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-canvas text-accent-dark"
                : "text-ink-soft hover:bg-canvas text-ink"
            }`
          }
        >
          <Icon size={17} strokeWidth={2} />
          {t(key)}
        </NavLink>
      ))}
    </nav>
  );
}

export function MobileNavOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 bg-surface shadow-popover animate-fadeUp">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <span className="font-display font-semibold text-ink">SYJ PropertySync</span>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <Nav onNavigate={onClose} />
      </div>
    </div>
  );
}
