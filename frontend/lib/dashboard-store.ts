// lib/dashboard-store.ts
// Zustand store powering the dashboard.
// Supports both optimistic in-memory updates AND server-side hydration
// from the Prisma-backed API for real-time persistence.

import { create } from "zustand";

export type ActivityType =
  | "soql-generated"
  | "excel-operation"
  | "favourite-added"
  | "favourite-removed"
  | "ticket-formatted"
  | "template-created"
  | "template-updated"
  | "template-deleted"
  | "asset-transfer"
  | "case-assignment"
  | "ticket-cancellation";

export interface ActivityEntry {
  id: string;
  type: ActivityType | string;
  label: string;
  meta?: string;
  module?: string;
  timestamp: string; // ISO string — always real, always accountable
}

/** Shape returned by GET /api/dashboard */
export interface ServerMetric {
  key: string;
  value: number;
  weeklyValue: number;
  label: string;
  category: string;
  updatedAt: string;
}

export interface ServerEvent {
  id: string;
  type: string;
  label: string;
  meta: string | null;
  module: string;
  createdAt: string;
}

interface DashboardState {
  // ─── KPI counters ──────────────────────────────────────────────────
  soqlGeneratedCount: number;
  soqlGeneratedCountTotal: number;
  excelOperationCount: number;
  excelOperationCountTotal: number;
  ticketsProcessedCount: number;
  ticketsProcessedCountTotal: number;
  ticketCancellationCount: number;
  ticketCancellationCountTotal: number;
  assetTransferCount: number;
  assetTransferCountTotal: number;
  caseAssignmentCount: number;
  caseAssignmentCountTotal: number;
  templatesCreatedCount: number;
  templatesCreatedCountTotal: number;

  // ─── Other state ───────────────────────────────────────────────────
  favourites: Set<string>;
  activity: ActivityEntry[];

  // ─── Server hydration ──────────────────────────────────────────────
  isHydrated: boolean;
  lastHydratedAt: string | null;

  // ─── Actions — local optimistic updates ────────────────────────────
  recordSOQL: (templateName: string, ticketCount: number) => void;
  recordExcelOperation: (operationName: string, rowCount?: number) => void;
  recordTicketFormatted: (count: number) => void;
  recordFavourite: (templateName: string) => void;
  removeFavourite: (templateName: string) => void;
  recordTemplateEvent: (
    type: "template-created" | "template-updated" | "template-deleted",
    templateName: string
  ) => void;
  clearActivity: () => void;

  // ─── Actions — server persistence helpers ──────────────────────────
  incrementMetric: (key: string, amount: number) => void;
  pushServerActivity: (entry: {
    type: string;
    label: string;
    meta?: string;
    module: string;
  }) => void;
  hydrateFromServer: (
    metrics: ServerMetric[],
    events: ServerEvent[]
  ) => void;
  resetStore: () => void;
}

const MAX_ACTIVITY_ITEMS = 50;

function makeId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function pushActivity(
  activity: ActivityEntry[],
  entry: Omit<ActivityEntry, "id" | "timestamp">
): ActivityEntry[] {
  const next: ActivityEntry = {
    ...entry,
    id: makeId(),
    timestamp: new Date().toISOString(),
  };
  return [next, ...activity].slice(0, MAX_ACTIVITY_ITEMS);
}

/** Map a server metric key to its corresponding state field. */
const METRIC_KEY_TO_FIELD: Record<string, keyof DashboardState> = {
  soql_generated: "soqlGeneratedCount",
  excel_operations: "excelOperationCount",
  tickets_formatted: "ticketsProcessedCount",
  ticket_cancellation: "ticketCancellationCount",
  asset_transfer: "assetTransferCount",
  case_assignment: "caseAssignmentCount",
  templates_created: "templatesCreatedCount",
};

export const useDashboardStore = create<DashboardState>((set) => ({
  soqlGeneratedCount: 0,
  soqlGeneratedCountTotal: 0,
  excelOperationCount: 0,
  excelOperationCountTotal: 0,
  ticketsProcessedCount: 0,
  ticketsProcessedCountTotal: 0,
  ticketCancellationCount: 0,
  ticketCancellationCountTotal: 0,
  assetTransferCount: 0,
  assetTransferCountTotal: 0,
  caseAssignmentCount: 0,
  caseAssignmentCountTotal: 0,
  templatesCreatedCount: 0,
  templatesCreatedCountTotal: 0,
  favourites: new Set<string>(),
  activity: [],
  isHydrated: false,
  lastHydratedAt: null,

  // ─── Local optimistic actions ────────────────────────────────────

  recordSOQL: (templateName, ticketCount) =>
    set((state) => ({
      soqlGeneratedCount: state.soqlGeneratedCount + 1,
      soqlGeneratedCountTotal: state.soqlGeneratedCountTotal + 1,
      ticketsProcessedCount: state.ticketsProcessedCount + ticketCount,
      ticketsProcessedCountTotal: state.ticketsProcessedCountTotal + ticketCount,
      activity: pushActivity(state.activity, {
        type: "soql-generated",
        label: `SOQL generated · ${templateName}`,
        meta: `${ticketCount} ticket${ticketCount === 1 ? "" : "s"}`,
      }),
    })),

  recordExcelOperation: (operationName, rowCount) =>
    set((state) => ({
      excelOperationCount: state.excelOperationCount + 1,
      excelOperationCountTotal: state.excelOperationCountTotal + 1,
      activity: pushActivity(state.activity, {
        type: "excel-operation",
        label: `Excel operation · ${operationName}`,
        meta: rowCount !== undefined ? `${rowCount} rows` : undefined,
      }),
    })),

  recordTicketFormatted: (count) =>
    set((state) => ({
      ticketsProcessedCount: state.ticketsProcessedCount + count,
      ticketsProcessedCountTotal: state.ticketsProcessedCountTotal + count,
      activity: pushActivity(state.activity, {
        type: "ticket-formatted",
        label: "Tickets formatted",
        meta: `${count} ticket${count === 1 ? "" : "s"}`,
      }),
    })),

  recordFavourite: (templateName) =>
    set((state) => {
      const next = new Set(state.favourites);
      next.add(templateName);
      return {
        favourites: next,
        activity: pushActivity(state.activity, {
          type: "favourite-added",
          label: "Favourite added",
          meta: templateName,
        }),
      };
    }),

  removeFavourite: (templateName) =>
    set((state) => {
      const next = new Set(state.favourites);
      next.delete(templateName);
      return {
        favourites: next,
        activity: pushActivity(state.activity, {
          type: "favourite-removed",
          label: "Favourite removed",
          meta: templateName,
        }),
      };
    }),

  recordTemplateEvent: (type, templateName) =>
    set((state) => ({
      templatesCreatedCount: state.templatesCreatedCount + (type === "template-created" ? 1 : type === "template-deleted" ? -1 : 0),
      templatesCreatedCountTotal: state.templatesCreatedCountTotal + (type === "template-created" ? 1 : type === "template-deleted" ? -1 : 0),
      activity: pushActivity(state.activity, {
        type,
        label:
          type === "template-created"
            ? "Template created"
            : type === "template-updated"
            ? "Template updated"
            : "Template deleted",
        meta: templateName,
      }),
    })),

  clearActivity: () => set({ activity: [] }),

  // ─── Server persistence helpers ──────────────────────────────────

  incrementMetric: (key, amount) =>
    set((state) => {
      const field = METRIC_KEY_TO_FIELD[key];
      if (!field) return {};
      return { 
        [field]: (state[field] as number) + amount,
        [`${field}Total`]: (state[`${field}Total` as keyof DashboardState] as number) + amount 
      } as Partial<DashboardState>;
    }),

  pushServerActivity: (entry) =>
    set((state) => ({
      activity: pushActivity(state.activity, {
        type: entry.type,
        label: entry.label,
        meta: entry.meta,
        module: entry.module,
      }),
    })),

  hydrateFromServer: (metrics, events) =>
    set(() => {
      const partial: Record<string, number> = {};
      for (const m of metrics) {
        const field = METRIC_KEY_TO_FIELD[m.key];
        if (field) {
          partial[field as string] = m.weeklyValue;
          partial[`${field}Total`] = m.value;
        }
      }

      const activity: ActivityEntry[] = events.map((e) => ({
        id: e.id,
        type: e.type,
        label: e.label,
        meta: e.meta ?? undefined,
        module: e.module,
        timestamp: e.createdAt,
      }));

      return {
        ...partial,
        activity,
        isHydrated: true,
        lastHydratedAt: new Date().toISOString(),
      };
    }),

  resetStore: () =>
    set({
      soqlGeneratedCount: 0,
      excelOperationCount: 0,
      ticketsProcessedCount: 0,
      ticketCancellationCount: 0,
      assetTransferCount: 0,
      caseAssignmentCount: 0,
      templatesCreatedCount: 0,
      activity: [],
    }),
}));

// Backward-compatible plain object API, so existing call sites like
// `dashboardStore.recordSOQL(...)` keep working without a rewrite.
export const dashboardStore = {
  recordSOQL: (templateName: string, ticketCount: number) =>
    useDashboardStore.getState().recordSOQL(templateName, ticketCount),
  recordExcelOperation: (operationName: string, rowCount?: number) =>
    useDashboardStore.getState().recordExcelOperation(operationName, rowCount),
  recordTicketFormatted: (count: number) =>
    useDashboardStore.getState().recordTicketFormatted(count),
  recordFavourite: (templateName: string) =>
    useDashboardStore.getState().recordFavourite(templateName),
  removeFavourite: (templateName: string) =>
    useDashboardStore.getState().removeFavourite(templateName),
  recordTemplateEvent: (
    type: "template-created" | "template-updated" | "template-deleted",
    templateName: string
  ) => useDashboardStore.getState().recordTemplateEvent(type, templateName),
};