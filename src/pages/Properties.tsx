import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { useI18n } from "../i18n";
import { useDemoStore } from "../services/demoStore";
import { Property, PropertyType } from "../types";
import { StatusBadge, toneForSyncStatus } from "../components/StatusBadge";

type SortKey = "id" | "city" | "rent" | "updated";

const PAGE_SIZE = 5;

export default function Properties() {
  const { t, formatCurrency, formatDate } = useI18n();
  const { properties } = useDemoStore();

  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);

  const cities = useMemo(() => Array.from(new Set(properties.map((p) => p.city))), [properties]);
  const types = useMemo(() => Array.from(new Set(properties.map((p) => p.propertyType))), [properties]);

  const filtered = useMemo(() => {
    let list = properties.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      const matchesCity = cityFilter === "all" || p.city === cityFilter;
      const matchesType = typeFilter === "all" || p.propertyType === typeFilter;
      const matchesStatus = statusFilter === "all" || p.syncStatus === statusFilter;
      return matchesQuery && matchesCity && matchesType && matchesStatus;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") cmp = a.id.localeCompare(b.id);
      if (sortKey === "city") cmp = a.city.localeCompare(b.city);
      if (sortKey === "rent") cmp = a.monthlyRent - b.monthlyRent;
      if (sortKey === "updated") cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return cmp * sortDir;
    });

    return list;
  }, [properties, query, cityFilter, typeFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{t("properties.title")}</h1>
        <p className="text-sm text-ink-faint mt-1">
          {t("properties.subtitle", { count: properties.length })}
        </p>
      </div>

      <div className="card p-4 flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t("properties.searchPlaceholder")}
            className="input pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            className="input w-auto text-sm py-2"
          >
            <option value="all">{t("common.city")}: {t("common.all")}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="input w-auto text-sm py-2"
          >
            <option value="all">{t("common.propertyType")}: {t("common.all")}</option>
            {types.map((ty) => (
              <option key={ty} value={ty}>
                {t(`propertyType.${ty}` as any)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input w-auto text-sm py-2"
          >
            <option value="all">{t("common.status")}: {t("common.all")}</option>
            {(["synced", "pending", "syncing", "failed", "warning"] as const).map((s) => (
              <option key={s} value={s}>
                {t(`syncStatus.${s}` as any)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas text-left text-xs uppercase tracking-wide text-ink-faint">
                <SortableTh label={t("properties.col.id")} active={sortKey === "id"} dir={sortDir} onClick={() => toggleSort("id")} />
                <th className="font-medium px-4 py-3">{t("properties.col.address")}</th>
                <SortableTh label={t("properties.col.city")} active={sortKey === "city"} dir={sortDir} onClick={() => toggleSort("city")} />
                <th className="font-medium px-4 py-3 hidden md:table-cell">{t("properties.col.type")}</th>
                <th className="font-medium px-4 py-3 hidden lg:table-cell">{t("properties.col.bedrooms")}</th>
                <SortableTh label={t("properties.col.rent")} active={sortKey === "rent"} dir={sortDir} onClick={() => toggleSort("rent")} />
                <SortableTh
                  label={t("properties.col.updated")}
                  active={sortKey === "updated"}
                  dir={sortDir}
                  onClick={() => toggleSort("updated")}
                  className="hidden md:table-cell"
                />
                <th className="font-medium px-4 py-3">{t("properties.col.sync")}</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p: Property) => (
                <tr key={p.id} className="border-t border-line hover:bg-canvas transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/properties/${p.id}`} className="font-mono text-xs text-accent hover:text-accent-dark font-medium">
                      {p.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink">{p.address}</td>
                  <td className="px-4 py-3 text-ink-faint">{p.city}</td>
                  <td className="px-4 py-3 text-ink-faint hidden md:table-cell">{t(`propertyType.${p.propertyType}` as any)}</td>
                  <td className="px-4 py-3 text-ink-faint hidden lg:table-cell">{p.bedrooms || "—"}</td>
                  <td className="px-4 py-3 text-ink font-medium">{formatCurrency(p.monthlyRent)}</td>
                  <td className="px-4 py-3 text-ink-faint hidden md:table-cell">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={t(`syncStatus.${p.syncStatus}` as any)} tone={toneForSyncStatus(p.syncStatus)} />
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-faint">
                    {t("properties.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-line text-sm">
          <span className="text-ink-faint text-xs">
            {filtered.length} {t("nav.properties").toLowerCase()}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              {t("common.previous")}
            </button>
            <span className="text-xs text-ink-faint font-mono">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
  className = "",
}: {
  label: string;
  active: boolean;
  dir: 1 | -1;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={`font-medium px-4 py-3 ${className}`}>
      <button onClick={onClick} className="flex items-center gap-1 hover:text-ink transition-colors">
        {label}
        {active && (dir === 1 ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
      </button>
    </th>
  );
}
