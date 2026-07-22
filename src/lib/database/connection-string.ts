// Build the Postgres connection string from the individual POSTGRES_* parts so
// the same credentials drive the app, the Prisma CLI, and the compose db service.
export function buildConnectionString() {
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const db = process.env.POSTGRES_DB;
  const host = process.env.POSTGRES_HOST ?? 'localhost';
  const port = process.env.POSTGRES_PORT ?? '5432';
  const sslmode = process.env.POSTGRES_SSLMODE;

  if (!user || !password || !db) {
    throw new Error(
      'Missing POSTGRES_USER, POSTGRES_PASSWORD, or POSTGRES_DB env vars.',
    );
  }

  const query = sslmode ? `?sslmode=${sslmode}` : '';

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
    password,
  )}@${host}:${port}/${db}${query}`;
}
