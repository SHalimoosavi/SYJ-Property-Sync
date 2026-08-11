import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Waypoints,
  RefreshCw,
  History,
} from "lucide-react";
import { useI18n } from "../i18n";
import { LANGUAGE_NAMES } from "../i18n";
import { useDemoStore } from "../services/demoStore";
import { usePipelineRunner } from "../services/usePipelineRunner";
import { PipelineVisualizer } from "../components/PipelineVisualizer";
import { ValidationList } from "../components/ValidationList";
import { NormalizationTable } from "../components/NormalizationTable";
import { DuplicatePanel } from "../components/DuplicatePanel";
import { StatusBadge, toneForSyncStatus } from "../components/StatusBadge";
import type { LocaleCode, Property, PropertyFeatures } from "../types";

const FEATURE_KEYS: (keyof PropertyFeatures)[] = [
  "balcony",
  "parking",
  "sauna",
  "elevator",
  "furnished",
  "petsAllowed",
  "accessible",
];

const PREVIEW_LANGS: LocaleCode[] = ["fi", "en", "de", "pl", "es", "pt"];

interface FormState {
  monthlyRent: number;
  availabilityDate: string;
  bedrooms: number;
  areaSqm: number;
  descriptionFi: string;
  descriptionEn: string;
  features: PropertyFeatures;
  agentPhone: string;
  agentEmail: string;
  simulateFailure: boolean;
}

function formFromProperty(p: Property): FormState {
  return {
    monthlyRent: p.monthlyRent,
    availabilityDate: p.availabilityDate,
    bedrooms: p.bedrooms,
    areaSqm: p.areaSqm,
    descriptionFi: p.descriptions.fi ?? "",
    descriptionEn: p.descriptions.en ?? "",
    features: { ...p.features },
    agentPhone: p.agentPhone,
    agentEmail: p.agentEmail,
    simulateFailure: false,
  };
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, formatCurrency, formatDate, formatDateTime } = useI18n();
  const { getProperty, dispatch } = useDemoStore();
  const property = id ? getProperty(id) : undefined;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [previewLang, setPreviewLang] = useState<LocaleCode>("fi");
  const [showPipeline, setShowPipeline] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<{ next: Property; prev: Property } | null>(null);

  const pipeline = usePipelineRunner();

  if (!property) {
    return (
      <div className="card p-8 text-center">
        <p className="text-ink-faint">Property not found.</p>
        <Link to="/properties" className="text-accent hover:text-accent-dark text-sm font-medium mt-2 inline-block">
          {t("common.back")}
        </Link>
      </div>
    );
  }

  function startEdit() {
    setForm(formFromProperty(property!));
    setEditing(true);
    setShowPipeline(false);
    pipeline.reset();
  }

  function cancelEdit() {
    setEditing(false);
    setForm(null);
  }

  function saveAndSync() {
    if (!form || !property) return;
    const next: Property = {
      ...property,
      monthlyRent: form.monthlyRent,
      availabilityDate: form.availabilityDate,
      bedrooms: form.bedrooms,
      areaSqm: form.areaSqm,
      descriptions: { ...property.descriptions, fi: form.descriptionFi, en: form.descriptionEn },
      features: form.features,
      agentPhone: form.agentPhone,
      agentEmail: form.agentEmail,
      updatedAt: new Date().toISOString(),
      syncStatus: "syncing",
    };
    dispatch({ type: "SET_PROPERTY_SYNC_STATUS", propertyId: property.id, status: "syncing" });
    setLastSubmitted({ next, prev: property });
    setEditing(false);
    setShowPipeline(true);
    pipeline.run(next, property, { simulateFailure: form.simulateFailure });
  }

  function retry() {
    if (!lastSubmitted) return;
    pipeline.run(lastSubmitted.next, lastSubmitted.prev, { simulateFailure: false });
  }

  const overallMessage =
    pipeline.overallStatus === "success"
      ? t("pipeline.overallSuccess")
      : pipeline.overallStatus === "success_with_warnings"
      ? t("pipeline.overallWarning")
      : pipeline.overallStatus === "failed"
      ? t("pipeline.overallFailed")
      : pipeline.overallStatus === "running"
      ? t("pipeline.overallRunning")
      : "";

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/properties")} className="text-ink-faint hover:text-ink">
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink truncate">{property.address}</h1>
            <StatusBadge label={t(`syncStatus.${property.syncStatus}` as any)} tone={toneForSyncStatus(property.syncStatus)} pulse={property.syncStatus === "syncing"} />
          </div>
          <div className="text-xs text-ink-faint font-mono mt-0.5">{property.id} · {property.city}, {property.country}</div>
        </div>
        {!editing && (
          <button onClick={startEdit} className="btn-primary shrink-0">
            <Pencil size={15} />
            <span className="hidden sm:inline">{t("detail.editAndSync")}</span>
          </button>
        )}
      </div>

      {editing && form ? (
        <EditForm
          form={form}
          setForm={setForm}
          property={property}
          onCancel={cancelEdit}
          onSave={saveAndSync}
        />
      ) : (
        <ViewSections property={property} previewLang={previewLang} setPreviewLang={setPreviewLang} />
      )}

      {showPipeline && (
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <h2 className="font-display font-semibold text-ink flex items-center gap-2">
              <Waypoints size={17} className="text-accent" />
              {t("pipeline.title")}
            </h2>
            {property.id === lastSubmitted?.next.id && (
              <Link to="/audit-log" className="text-xs text-accent hover:text-accent-dark font-medium inline-flex items-center gap-1">
                <History size={12} />
                {t("pipeline.viewAudit")}
              </Link>
            )}
          </div>
          <p className="text-xs text-ink-faint mb-5">{t("pipeline.subtitle")}</p>

          <PipelineVisualizer stages={pipeline.stages} />

          {overallMessage && (
            <div
              className={`mt-6 rounded-lg p-3.5 text-sm font-medium flex items-center gap-2 ${
                pipeline.overallStatus === "success"
                  ? "bg-success-soft text-success"
                  : pipeline.overallStatus === "success_with_warnings"
                  ? "bg-warning-soft text-warning"
                  : pipeline.overallStatus === "failed"
                  ? "bg-danger-soft text-danger"
                  : "bg-accent-soft text-accent-dark"
              }`}
            >
              {pipeline.overallStatus === "success" && <Check size={16} />}
              {pipeline.overallStatus === "failed" && <AlertTriangle size={16} />}
              {overallMessage}
            </div>
          )}

          {pipeline.overallStatus === "failed" && (
            <button onClick={retry} className="btn-primary mt-4">
              <RefreshCw size={15} />
              {t("common.retry")}
            </button>
          )}

          {pipeline.validationResults.length > 0 && (
            <Section title={t("validation.title")} subtitle={t("validation.subtitle")}>
              <ValidationList results={pipeline.validationResults} />
            </Section>
          )}

          {pipeline.normalizationChanges.length > 0 && (
            <Section title={t("normalization.title")} subtitle={t("normalization.subtitle")}>
              <NormalizationTable changes={pipeline.normalizationChanges} />
            </Section>
          )}

          {pipeline.stages.find((s) => s.id === "duplicate_detection")?.status !== "pending" && (
            <Section title={t("duplicate.title")} subtitle={t("duplicate.subtitle")}>
              <DuplicatePanel candidates={pipeline.duplicates} />
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 pt-6 border-t border-line">
      <h3 className="font-display font-semibold text-ink text-sm mb-0.5">{title}</h3>
      <p className="text-xs text-ink-faint mb-3">{subtitle}</p>
      {children}
    </div>
  );
}

function ViewSections({
  property,
  previewLang,
  setPreviewLang,
}: {
  property: Property;
  previewLang: LocaleCode;
  setPreviewLang: (l: LocaleCode) => void;
}) {
  const { t, formatCurrency, formatDate } = useI18n();
  const description = property.descriptions[previewLang];

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-4">{t("detail.basicInfo")}</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <Field label={t("common.propertyType")} value={t(`propertyType.${property.propertyType}` as any)} />
            <Field label={t("properties.col.bedrooms")} value={String(property.bedrooms)} />
            <Field label={t("detail.bathrooms")} value={String(property.bathrooms)} />
            <Field label={t("detail.area")} value={`${property.areaSqm} m²`} />
            <Field label={t("detail.floor")} value={property.floor} />
            <Field label={t("detail.rent")} value={formatCurrency(property.monthlyRent)} />
            <Field label={t("detail.deposit")} value={formatCurrency(property.deposit)} />
            <Field label={t("detail.availabilityDate")} value={formatDate(property.availabilityDate)} />
            <Field label={t("detail.postalCode")} value={property.postalCode} />
            <Field label={t("detail.country")} value={property.country} />
          </dl>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <h2 className="font-display font-semibold text-ink">{t("detail.multilingualPreview")}</h2>
          </div>
          <p className="text-xs text-ink-faint mb-3">{t("detail.multilingualPreview.body")}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PREVIEW_LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setPreviewLang(l)}
                className={`badge border transition-colors ${
                  previewLang === l ? "bg-accent text-white border-accent" : "bg-surface border-line text-ink-faint hover:text-ink"
                }`}
              >
                {LANGUAGE_NAMES[l]}
              </button>
            ))}
          </div>
          <div className="rounded-lg bg-canvas p-4 text-sm text-ink leading-relaxed min-h-[64px]">
            {description && description.trim().length > 0 ? (
              description
            ) : (
              <span className="text-ink-faint italic">
                {t("detail.missingTranslation", { lang: LANGUAGE_NAMES[previewLang] })}
              </span>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-4">{t("detail.features")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURE_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                    property.features[key] ? "bg-success-soft text-success" : "bg-canvas text-ink-faint"
                  }`}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className={property.features[key] ? "text-ink" : "text-ink-faint"}>
                  {t(`detail.feature.${key}` as any)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-3">{t("detail.media")}</h2>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {Array.from({ length: Math.min(6, property.imageCount) }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-canvas border border-line flex items-center justify-center text-ink-faint">
                <ImageIcon size={18} />
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-faint mb-2">{t("detail.imageCount", { count: property.imageCount })}</p>
          <StatusBadge
            label={property.imageCount >= 3 ? t("detail.imagesOk") : t("detail.imagesWarning")}
            tone={property.imageCount >= 3 ? "success" : "warning"}
          />
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink mb-3">{t("detail.contact")}</h2>
          <dl className="flex flex-col gap-2.5 text-sm">
            <Field label={t("detail.agent")} value={property.agentName} />
            <Field label={t("detail.phone")} value={property.agentPhone} mono />
            <Field label={t("detail.email")} value={property.agentEmail} mono />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-ink-faint uppercase tracking-wide">{label}</dt>
      <dd className={`text-ink mt-0.5 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function EditForm({
  form,
  setForm,
  property,
  onCancel,
  onSave,
}: {
  form: FormState;
  setForm: (updater: (prev: FormState | null) => FormState | null) => void;
  property: Property;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { t } = useI18n();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="font-display font-semibold text-ink mb-5">{t("detail.editTitle")}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{t("detail.rent")}</label>
          <input
            type="number"
            className="input"
            value={form.monthlyRent}
            onChange={(e) => update("monthlyRent", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">{t("detail.availabilityDate")}</label>
          <input
            type="date"
            className="input"
            value={form.availabilityDate}
            onChange={(e) => update("availabilityDate", e.target.value)}
          />
        </div>
        <div>
          <label className="label">{t("properties.col.bedrooms")}</label>
          <input
            type="number"
            className="input"
            value={form.bedrooms}
            onChange={(e) => update("bedrooms", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">{t("detail.area")}</label>
          <input
            type="number"
            className="input"
            value={form.areaSqm}
            onChange={(e) => update("areaSqm", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">{t("detail.phone")}</label>
          <input
            type="text"
            className="input"
            value={form.agentPhone}
            onChange={(e) => update("agentPhone", e.target.value)}
          />
        </div>
        <div>
          <label className="label">{t("detail.email")}</label>
          <input
            type="text"
            className="input"
            value={form.agentEmail}
            onChange={(e) => update("agentEmail", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">{t("validation.field.description_fi")}</label>
          <textarea
            className="input min-h-[80px]"
            value={form.descriptionFi}
            onChange={(e) => update("descriptionFi", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">{t("validation.field.description_en")}</label>
          <textarea
            className="input min-h-[80px]"
            value={form.descriptionEn}
            onChange={(e) => update("descriptionEn", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="label">{t("detail.features")}</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FEATURE_KEYS.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={form.features[key]}
                onChange={(e) => update("features", { ...form.features, [key]: e.target.checked })}
                className="rounded border-line text-accent focus:ring-accent"
              />
              {t(`detail.feature.${key}` as any)}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-line">
        <label className="flex items-center gap-2 text-sm text-ink-faint cursor-pointer">
          <input
            type="checkbox"
            checked={form.simulateFailure}
            onChange={(e) => update("simulateFailure", e.target.checked)}
            className="rounded border-line text-danger focus:ring-danger"
          />
          {t("detail.simulateFailure")}
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={onSave} className="btn-primary">
          {t("detail.saveAndSync")}
        </button>
        <button onClick={onCancel} className="btn-secondary">
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}
