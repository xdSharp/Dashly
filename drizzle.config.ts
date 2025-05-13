import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  driver: "pg",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "dashly",
    password: process.env.DB_PASSWORD || "dashlypass",
    database: process.env.DB_NAME || "dashly_db",
  },
} satisfies Config;
