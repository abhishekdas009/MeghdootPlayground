import { prisma } from "@/lib/prisma";

export const METRIC_DEFINITIONS: Record<string, { label: string; category: string }> = {
  soql_generated: { label: "Queries Generated", category: "soql" },
  excel_operations: { label: "Excel Operations", category: "excel" },
  tickets_formatted: { label: "Tickets Formatted", category: "ticket" },
  ticket_cancellation: { label: "Ticket Cancellations", category: "ticket" },
  asset_transfer: { label: "Asset Transfers", category: "asset" },
  case_assignment: { label: "Case Assignments", category: "case" },
  templates_created: { label: "Query Library Templates", category: "template" },
  favourites_count: { label: "Favourites", category: "template" },
};

export type RecordMetricInput = {
  key: string;
  label: string;
  change?: number;
  category?: string;
  source?: string;
  module: string;
  meta?: string;
};

export interface MetricSnapshot {
  key: string;
  value: number;
  label: string;
  category: string;
  updatedAt: string;
}

export interface EventSnapshot {
  id: string;
  type: string;
  label: string;
  meta: string | null;
  module: string;
  createdAt: string;
}

export interface DashboardSnapshot {
  metrics: MetricSnapshot[];
  events: EventSnapshot[];
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [metrics, events, templateCount] = await Promise.all([
    prisma.dashboardMetric.findMany({ orderBy: { key: "asc" } }),
    prisma.dashboardEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.sOQLLibrary.count(),
  ]);

  return {
    metrics: metrics.map((m: any) => ({
      key: m.key,
      value: m.key === "templates_created" ? templateCount : m.value,
      weeklyValue: m.key === "templates_created" ? templateCount : m.weeklyValue,
      label: m.key === "templates_created" ? "Query Library Templates" : m.label,
      category: m.category,
      updatedAt: m.updatedAt.toISOString(),
    })),
    events: events.map((e: any) => ({
      id: e.id,
      type: e.type,
      label: e.label,
      meta: e.meta,
      module: e.module,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function incrementMetric(input: RecordMetricInput) {
  const change = input.change ?? 1;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const existing = await prisma.dashboardMetric.findUnique({
    where: { key: input.key },
  });

  const now = new Date();
  const thisMonday = getMonday(now);
  const shouldReset = !existing || existing.lastResetAt < thisMonday;

  await prisma.$transaction([
    prisma.dashboardMetric.upsert({
      where: { key: input.key },
      update: {
        value: { increment: change },
        weeklyValue: shouldReset ? change : { increment: change },
        lastResetAt: shouldReset ? now : undefined,
        label: input.label,
        category: input.category ?? "general",
      },
      create: {
        key: input.key,
        label: input.label,
        value: change,
        weeklyValue: change,
        lastResetAt: now,
        category: input.category ?? "general",
      },
    }),
    prisma.dashboardEvent.create({
      data: {
        type: input.key,
        label: input.label,
        meta: input.meta || null,
        module: input.module,
      },
    }),
    prisma.dashboardEvent.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    }),
  ]);
}

export async function trackMetricEvent(input: {
  metricKey: string;
  incrementBy: number;
  event: {
    type: string;
    label: string;
    meta?: string;
    module: string;
  };
}) {
  const def = METRIC_DEFINITIONS[input.metricKey];
  return incrementMetric({
    key: input.metricKey,
    label: input.event.label,
    change: input.incrementBy,
    category: def?.category ?? "general",
    module: input.event.module,
    meta: input.event.meta,
  });
}

export async function setMetricValue(input: {
  key: string;
  label: string;
  value: number;
  category?: string;
}) {
  const existing = await prisma.dashboardMetric.findUnique({
    where: { key: input.key },
  });

  const now = new Date();
  const thisMonday = getMonday(now);
  const shouldReset = !existing || existing.lastResetAt < thisMonday;

  await prisma.dashboardMetric.upsert({
    where: { key: input.key },
    update: {
      value: input.value,
      weeklyValue: shouldReset ? input.value : input.value, // It's a set value, not increment, so just set it.
      lastResetAt: shouldReset ? now : undefined,
      label: input.label,
      category: input.category ?? "general",
    },
    create: {
      key: input.key,
      label: input.label,
      value: input.value,
      weeklyValue: input.value,
      lastResetAt: now,
      category: input.category ?? "general",
    },
  });
}

export async function resetDashboardMetrics() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.dashboardMetric.updateMany({
      data: { value: 0 },
    }),
    prisma.dashboardEvent.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    }),
  ]);
  return true;
}