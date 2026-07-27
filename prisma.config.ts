import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "frontend/prisma/schema.prisma",
  migrations: {
    path: "frontend/prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
