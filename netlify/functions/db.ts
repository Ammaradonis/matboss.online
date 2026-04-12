import pg from 'pg';

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function parsePort(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveSsl(connectionString?: string) {
  const dbSsl = readEnv('DB_SSL')?.toLowerCase();

  if (dbSsl === 'false' || dbSsl === '0' || dbSsl === 'off') {
    return false;
  }

  if (
    dbSsl === 'true' ||
    dbSsl === '1' ||
    dbSsl === 'require' ||
    dbSsl === 'no-verify' ||
    connectionString?.includes('sslmode=require')
  ) {
    return { rejectUnauthorized: false };
  }

  return false;
}

function createPool() {
  const connectionString = readEnv('DATABASE_URL');
  const ssl = resolveSsl(connectionString);

  if (connectionString) {
    return new pg.Pool({
      connectionString,
      ssl,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  return new pg.Pool({
    host: readEnv('DB_HOST') ?? 'localhost',
    port: parsePort(readEnv('DB_PORT'), 4040),
    database: readEnv('DB_NAME') ?? 'matboss_online',
    user: readEnv('DB_USER') ?? 'postgres',
    password: readEnv('DB_PASSWORD'),
    ssl,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

const pool = createPool();

export default pool;
