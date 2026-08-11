import { useCallback, useRef, useState } from "react";
import {
  DuplicateCandidate,
  NormalizationChange,
  PipelineStage,
  PipelineStageId,
  Property,
  ValidationResult,
} from "../types";
import { detectDuplicates, normalizeProperty, validateProperty } from "./engine";
import { useDemoStore, nextId } from "./demoStore";

const STAGE_ORDER: PipelineStageId[] = [
  "change_detected",
  "validation",
  "normalization",
  "duplicate_detection",
  "central_update",
  "crm_sync",
  "website_sync",
  "portal_sync",
  "verification",
  "audit_log",
];

const BASE_DURATIONS: Record<PipelineStageId, number> = {
  change_detected: 220,
  validation: 420,
  normalization: 320,
  duplicate_detection: 260,
  central_update: 480,
  crm_sync: 760,
  website_sync: 560,
  portal_sync: 900,
  verification: 380,
  audit_log: 220,
};

function initialStages(): PipelineStage[] {
  return STAGE_ORDER.map((id) => ({ id, status: "pending", durationMs: null }));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type OverallStatus = "idle" | "running" | "success" | "success_with_warnings" | "failed";

export function usePipelineRunner() {
  const { dispatch, properties } = useDemoStore();
  const [stages, setStages] = useState<PipelineStage[]>(initialStages);
  const [overallStatus, setOverallStatus] = useState<OverallStatus>("idle");
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [normalizationChanges, setNormalizationChanges] = useState<NormalizationChange[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const runIdRef = useRef(0);

  const setStage = useCallback((id: PipelineStageId, patch: Partial<PipelineStage>) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const run = useCallback(
    async (
      property: Property,
      previousProperty: Property | null,
      options?: { simulateFailure?: boolean }
    ) => {
      const myRun = ++runIdRef.current;
      setOverallStatus("running");
      setStages(initialStages());
      setValidationResults([]);
      setNormalizationChanges([]);
      setDuplicates([]);

      let sawError = false;
      let sawWarning = false;

      for (const stageId of STAGE_ORDER) {
        if (runIdRef.current !== myRun) return; // superseded by a newer run
        setStage(stageId, { status: "running", durationMs: null });
        const duration = BASE_DURATIONS[stageId] + Math.round(Math.random() * 120 - 60);
        await sleep(Math.max(120, duration));
        if (runIdRef.current !== myRun) return;

        if (stageId === "validation") {
          const results = validateProperty(property);
          setValidationResults(results);
          const hasError = results.some((r) => r.severity === "error");
          const hasWarning = results.some((r) => r.severity === "warning");
          if (hasError) {
            sawError = true;
            setStage(stageId, { status: "failed", durationMs: duration });
            setOverallStatus("failed");
            dispatch({ type: "SET_PROPERTY_SYNC_STATUS", propertyId: property.id, status: "failed" });
            return;
          }
          if (hasWarning) sawWarning = true;
          setStage(stageId, { status: hasWarning ? "warning" : "completed", durationMs: duration });
          continue;
        }

        if (stageId === "normalization") {
          setNormalizationChanges(normalizeProperty(property));
          setStage(stageId, { status: "completed", durationMs: duration });
          continue;
        }

        if (stageId === "duplicate_detection") {
          const found = detectDuplicates(property, properties);
          setDuplicates(found);
          const risky = found.some((d) => d.confidence >= 85);
          if (risky) sawWarning = true;
          setStage(stageId, { status: risky ? "warning" : "completed", durationMs: duration });
          continue;
        }

        if (stageId === "portal_sync" && options?.simulateFailure) {
          sawError = true;
          setStage(stageId, {
            status: "failed",
            durationMs: duration,
            message: "sync.demoFailure.reason",
          });
          setOverallStatus("failed");
          dispatch({ type: "SET_PROPERTY_SYNC_STATUS", propertyId: property.id, status: "failed" });

          dispatch({
            type: "ADD_SYNC_JOB",
            job: {
              id: nextId("JOB"),
              propertyId: property.id,
              connectorId: "portal",
              status: "failed",
              startedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              durationMs: duration,
              payloadSummary: `${property.id} → portal`,
              responseSummary: null,
              errorMessage: "Required field 'property_type' is missing.",
            },
          });
          return;
        }

        setStage(stageId, { status: "completed", durationMs: duration });
      }

      // Full success: commit property, connectors, audit trail
      dispatch({ type: "UPDATE_PROPERTY", property: { ...property, syncStatus: sawWarning ? "warning" : "synced" } });

      const now = new Date().toISOString();
      const corr = `corr-${Math.random().toString(16).slice(2, 8)}`;

      (["crm", "website", "portal"] as const).forEach((connectorId) => {
        dispatch({
          type: "ADD_SYNC_JOB",
          job: {
            id: nextId("JOB"),
            propertyId: property.id,
            connectorId,
            status: "completed",
            startedAt: now,
            completedAt: now,
            durationMs: BASE_DURATIONS[`${connectorId}_sync` as PipelineStageId],
            payloadSummary: `${property.id} → ${connectorId}`,
            responseSummary: "200 OK — record accepted",
            errorMessage: null,
          },
        });
        dispatch({ type: "UPDATE_CONNECTOR", connectorId, patch: { lastSync: now } });
      });

      if (previousProperty && previousProperty.monthlyRent !== property.monthlyRent) {
        dispatch({
          type: "ADD_AUDIT_ENTRY",
          entry: {
            id: nextId("AUD"),
            timestamp: now,
            actor: "Demo Admin",
            action: "audit.rent_updated",
            propertyId: property.id,
            previousValue: `€${previousProperty.monthlyRent.toLocaleString()}`,
            newValue: `€${property.monthlyRent.toLocaleString()}`,
            connector: "website",
            result: "success",
            correlationId: corr,
          },
        });
      }
      dispatch({
        type: "ADD_AUDIT_ENTRY",
        entry: {
          id: nextId("AUD"),
          timestamp: now,
          actor: "System",
          action: "audit.property_synced",
          propertyId: property.id,
          previousValue: null,
          newValue: null,
          connector: "system",
          result: "success",
          correlationId: corr,
        },
      });

      setOverallStatus(sawWarning ? "success_with_warnings" : "success");
    },
    [properties, dispatch, setStage]
  );

  const reset = useCallback(() => {
    runIdRef.current += 1;
    setStages(initialStages());
    setOverallStatus("idle");
    setValidationResults([]);
    setNormalizationChanges([]);
    setDuplicates([]);
  }, []);

  return { stages, overallStatus, validationResults, normalizationChanges, duplicates, run, reset };
}
