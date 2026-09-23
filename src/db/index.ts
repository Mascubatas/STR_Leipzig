import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(connectionString && !connectionString.includes("sample"));

// If live Neon URL is provided, initialize Neon client; otherwise lazy initialize or proxy
const sql = connectionString && !connectionString.includes("sample") 
  ? neon(connectionString) 
  : (null as unknown as ReturnType<typeof neon>);

export const db = isDbConfigured ? drizzle(sql, { schema }) : (null as unknown as ReturnType<typeof drizzle<typeof schema>>);

export * from "./schema";
