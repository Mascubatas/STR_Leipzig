/**
 * Resolves the PostgreSQL connection string from various standard environment variable names.
 * When Neon is provisioned on Vercel, it often provides POSTGRES_URL or DATABASE_URL.
 */
export function getDatabaseUrl(): string | null {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.NEON_DATABASE_URL;

  if (!url || url.includes("sample")) {
    return null;
  }
  return url;
}

export function isNeonConfigured(): boolean {
  return getDatabaseUrl() !== null;
}
