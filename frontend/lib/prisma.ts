import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import { Pool } from "pg";

// Ensure .env.local takes precedence over .env
loadEnv({ path: ".env.local", override: true, quiet: true });
loadEnv({ path: "../.env.local", override: true, quiet: true });
loadEnv({ path: ".env", quiet: true });
loadEnv({ path: "../.env", quiet: true });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const connectionString = rawConnectionString.replace(/^["']|["']$/g, '');

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("sslmode=require") || connectionString.includes("db.prisma.io")
    ? { rejectUnauthorized: false }
    : undefined,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
