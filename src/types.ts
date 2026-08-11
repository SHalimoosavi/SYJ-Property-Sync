export type LocaleCode = "fi" | "en" | "de" | "pl" | "es" | "pt";

export type SyncStatus =
  | "synced"
  | "pending"
  | "syncing"
  | "failed"
  | "warning";

export type PropertyType =
  | "apartment"
  | "house"
  | "studio"
  | "townhouse"
  | "office";

export interface LocalizedText {
  fi: string;
  en: string;
  de: string;
  pl: string;
  es: string;
  pt: string;
}

export interface PropertyFeatures {
  balcony: boolean;
  parking: boolean;
  sauna: boolean;
  elevator: boolean;
  furnished: boolean;
  petsAllowed: boolean;
  accessible: boolean;
}

export interface Property {
  id: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  floor: string;
  monthlyRent: number;
  deposit: number;
  availabilityDate: string; // ISO date
  descriptions: Partial<LocalizedText>;
  imageCount: number;
  features: PropertyFeatures;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  status: "active" | "draft" | "archived";
}

export type ConnectorId =
  | "crm"
  | "website"
  | "portal"
  | "email"
  | "webhook"
  | "csv"
  | "api";

export interface Connector {
  id: ConnectorId;
  name: string;
  status: "connected" | "degraded" | "disconnected";
  lastSync: string | null;
  recordsSynced: number;
  latencyMs: number;
  successRate: number; // 0-100
  simulated: true;
}

export type PipelineStageId =
  | "change_detected"
  | "validation"
  | "normalization"
  | "duplicate_detection"
  | "central_update"
  | "crm_sync"
  | "website_sync"
  | "portal_sync"
  | "verification"
  | "audit_log";

export type StageStatus = "pending" | "running" | "completed" | "warning" | "failed";

export interface PipelineStage {
  id: PipelineStageId;
  status: StageStatus;
  durationMs: number | null;
  message?: string;
}

export interface PipelineRun {
  id: string;
  propertyId: string;
  startedAt: string;
  completedAt: string | null;
  stages: PipelineStage[];
  overallStatus: "running" | "success" | "failed" | "success_with_warnings";
}

export type ValidationSeverity = "pass" | "warning" | "error";

export interface ValidationResult {
  field: string;
  severity: ValidationSeverity;
  messageKey: string;
  messageParams?: Record<string, string | number>;
}

export interface NormalizationChange {
  field: string;
  original: string;
  normalized: string;
  ruleKey: string;
}

export interface DuplicateCandidate {
  propertyId: string;
  comparedTo: string;
  confidence: number; // 0-100
  matchedFields: string[];
}

export type SyncJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "retrying";

export interface SyncJob {
  id: string;
  propertyId: string;
  connectorId: ConnectorId;
  status: SyncJobStatus;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  payloadSummary: string;
  responseSummary: string | null;
  errorMessage: string | null;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  propertyId: string;
  previousValue: string | null;
  newValue: string | null;
  connector: ConnectorId | "system";
  result: "success" | "failure";
  correlationId: string;
}
