import { createClient, type Client } from '@libsql/client';
import { SCHEMA_SQL } from './schema';
import { seedDatabase } from './seed';

declare global {
  // eslint-disable-next-line no-var
  var __ascendClient: Client | undefined;
  // eslint-disable-next-line no-var
  var __ascendDbReady: boolean | undefined;
}

export function getClient(): Client {
  if (!global.__ascendClient) {
    const url = process.env.TURSO_DATABASE_URL ?? `file:${process.env.ASCEND_DB_PATH ?? 'ascend.db'}`;
    global.__ascendClient = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return global.__ascendClient;
}

export async function ensureDb(): Promise<void> {
  if (global.__ascendDbReady) return;
  const client = getClient();
  const stmts = SCHEMA_SQL.split(';').map(s => s.trim()).filter(Boolean).map(sql => ({ sql }));
  await client.batch(stmts, 'write');
  await seedDatabase(client);
  global.__ascendDbReady = true;
}

export const USER_ID = 'demo-user-001';
