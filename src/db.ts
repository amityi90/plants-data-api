import { Pool } from "pg";

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || '';
    const useSSL = connectionString.includes('sslmode=require');
    pool = new Pool({
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      max: 5,
    });

    // Keep Neon alive — ping every 4 minutes to prevent free-tier suspension
    setInterval(() => {
      pool.query('SELECT 1').catch(() => {});
    }, 4 * 60 * 1000);
  }
  return pool;
}

export default new Proxy({} as Pool, {
  get(_target, prop) {
    return (getPool() as any)[prop];
  },
});
