// prisma/seed-metrics.ts
// One-time seed script to initialize DashboardMetric rows with value=0
// for every known metric key, so the dashboard works from a fresh database.
//
// Usage:  npx tsx prisma/seed-metrics.ts

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const METRICS: Array<{ key: string; label: string; category: string }> = [
  { key: "soql_generated", label: "Queries Generated", category: "soql" },
  { key: "excel_operations", label: "Excel Operations", category: "excel" },
  { key: "tickets_formatted", label: "Tickets Formatted", category: "ticket" },
  {
    key: "ticket_cancellation",
    label: "Ticket Cancellations",
    category: "ticket",
  },
  { key: "asset_transfer", label: "Asset Transfers", category: "asset" },
  { key: "case_assignment", label: "Case Assignments", category: "case" },
  {
    key: "templates_created",
    label: "Templates Created",
    category: "template",
  },
  { key: "favourites_count", label: "Favourites", category: "template" },
];

async function main() {
  console.log("🌱 Seeding dashboard metrics...\n");

  for (const metric of METRICS) {
    const result = await prisma.dashboardMetric.upsert({
      where: { key: metric.key },
      update: {},
      create: {
        key: metric.key,
        value: 0,
        label: metric.label,
        category: metric.category,
      },
    });

    console.log(
      `  ✓ ${result.key.padEnd(22)} → value: ${result.value} (${result.label})`
    );
  }

  console.log(`\n✅ Seeded ${METRICS.length} dashboard metrics.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
