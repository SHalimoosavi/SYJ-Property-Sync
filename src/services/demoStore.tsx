import React, { createContext, useContext, useMemo, useReducer } from "react";
import { seedProperties } from "../data/properties";
import { seedConnectors } from "../data/connectors";
import { seedAuditLog } from "../data/auditSeed";
import {
  AuditEntry,
  Connector,
  ConnectorId,
  Property,
  SyncJob,
  SyncJobStatus,
} from "../types";

interface DemoState {
  properties: Property[];
  connectors: Connector[];
  syncJobs: SyncJob[];
  auditLog: AuditEntry[];
  resetCount: number;
}

function seedSyncJobs(): SyncJob[] {
  return [
    {
      id: "JOB-5019-PORTAL",
      propertyId: "DEMO-PAIMIO-5019",
      connectorId: "portal",
      status: "failed",
      startedAt: "2026-08-10T08:55:40+03:00",
      completedAt: "2026-08-10T08:55:41+03:00",
      durationMs: 1200,
      payloadSummary: "DEMO-PAIMIO-5019 \u2192 portal",
      responseSummary: null,
      errorMessage: "Required field 'property_type' is missing.",
    },
    {
      id: "JOB-1042-CRM",
      propertyId: "DEMO-TURKU-1042",
      connectorId: "crm",
      status: "completed",
      startedAt: "2026-08-10T09:41:02+03:00",
      completedAt: "2026-08-10T09:41:03+03:00",
      durationMs: 820,
      payloadSummary: "DEMO-TURKU-1042 \u2192 crm",
      responseSummary: "200 OK \u2014 record accepted",
      errorMessage: null,
    },
    {
      id: "JOB-1044-CRM",
      propertyId: "DEMO-TURKU-1044",
      connectorId: "crm",
      status: "queued",
      startedAt: "2026-08-10T09:50:00+03:00",
      completedAt: null,
      durationMs: null,
      payloadSummary: "DEMO-TURKU-1044 \u2192 crm",
      responseSummary: null,
      errorMessage: null,
    },
  ];
}

function initialState(): DemoState {
  return {
    properties: seedProperties.map((p) => ({ ...p })),
    connectors: seedConnectors.map((c) => ({ ...c })),
    syncJobs: seedSyncJobs(),
    auditLog: [...seedAuditLog],
    resetCount: 0,
  };
}

type Action =
  | { type: "UPDATE_PROPERTY"; property: Property }
  | { type: "SET_PROPERTY_SYNC_STATUS"; propertyId: string; status: Property["syncStatus"] }
  | { type: "ADD_SYNC_JOB"; job: SyncJob }
  | { type: "UPDATE_SYNC_JOB"; jobId: string; patch: Partial<SyncJob> }
  | { type: "SET_SYNC_JOB_STATUS"; jobId: string; status: SyncJobStatus }
  | { type: "ADD_AUDIT_ENTRY"; entry: AuditEntry }
  | { type: "UPDATE_CONNECTOR"; connectorId: ConnectorId; patch: Partial<Connector> }
  | { type: "RESET_DEMO" };

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "UPDATE_PROPERTY":
      return {
        ...state,
        properties: state.properties.map((p) =>
          p.id === action.property.id ? action.property : p
        ),
      };
    case "SET_PROPERTY_SYNC_STATUS":
      return {
        ...state,
        properties: state.properties.map((p) =>
          p.id === action.propertyId ? { ...p, syncStatus: action.status } : p
        ),
      };
    case "ADD_SYNC_JOB":
      return { ...state, syncJobs: [action.job, ...state.syncJobs] };
    case "UPDATE_SYNC_JOB":
      return {
        ...state,
        syncJobs: state.syncJobs.map((j) =>
          j.id === action.jobId ? { ...j, ...action.patch } : j
        ),
      };
    case "SET_SYNC_JOB_STATUS":
      return {
        ...state,
        syncJobs: state.syncJobs.map((j) =>
          j.id === action.jobId ? { ...j, status: action.status } : j
        ),
      };
    case "ADD_AUDIT_ENTRY":
      return { ...state, auditLog: [action.entry, ...state.auditLog] };
    case "UPDATE_CONNECTOR":
      return {
        ...state,
        connectors: state.connectors.map((c) =>
          c.id === action.connectorId ? { ...c, ...action.patch } : c
        ),
      };
    case "RESET_DEMO":
      return { ...initialState(), resetCount: state.resetCount + 1 };
    default:
      return state;
  }
}

interface DemoStoreValue extends DemoState {
  dispatch: React.Dispatch<Action>;
  getProperty: (id: string) => Property | undefined;
}

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const value = useMemo<DemoStoreValue>(
    () => ({
      ...state,
      dispatch,
      getProperty: (id: string) => state.properties.find((p) => p.id === id),
    }),
    [state]
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore(): DemoStoreValue {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error("useDemoStore must be used within a DemoStoreProvider");
  return ctx;
}

let idCounter = 10000;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}
