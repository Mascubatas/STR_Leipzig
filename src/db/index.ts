import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "./connection";
import * as schema from "./schema";

const connectionString = getDatabaseUrl();

export const isDbConfigured = Boolean(connectionString);

// If live Neon URL is provided, initialize Neon client
const sql = connectionString 
  ? neon(connectionString) 
  : (null as unknown as ReturnType<typeof neon>);

export const db = isDbConfigured ? drizzle(sql, { schema }) : (null as unknown as ReturnType<typeof drizzle<typeof schema>>);

export * from "./schema";
export * from "./connection";
