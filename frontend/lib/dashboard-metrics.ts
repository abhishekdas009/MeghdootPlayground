import { prisma } from "@/lib/prisma";

type RecordMetricInput = {
  key: string;
  label: string;
  change?: number;
  category?: string;
  source?: string;
  module: string;
  meta?: string;
};

export async function incrementMetric(input: RecordMetricInput) {
  const change = input.change ?? 1;

  await prisma.$transaction([
    prisma.dashboardMetric.upsert({
      where: { key: input.key },
      update: {
        value: { increment: change },
        label: input.label,
        category: input.category ?? "general",
      },
      create: {
        key: input.key,
        label: input.label,
        value: change,
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
  ]);
}

export async function setMetricValue(input: {
  key: string;
  label: string;
  value: number;
  category?: string;
}) {
  await prisma.dashboardMetric.upsert({
    where: { key: input.key },
    update: {
      value: input.value,
      label: input.label,
      category: input.category ?? "general",
    },
    create: {
      key: input.key,
      label: input.label,
      value: input.value,
      category: input.category ?? "general",
    },
  });
}

export async function getDashboardSnapshot() {
  const [metrics, events] = await Promise.all([
    prisma.dashboardMetric.findMany({
      orderBy: { label: "asc" },
    }),
    prisma.dashboardEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return { metrics, events };
}
