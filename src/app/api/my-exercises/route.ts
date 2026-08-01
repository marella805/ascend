import { NextRequest } from 'next/server';
import { ensureDb, getClient } from '@/lib/db/index';

const USER_ID = 'demo-user-001';

async function getMyExerciseSlugs(): Promise<string[]> {
  const client = getClient();
  const r = await client.execute({ sql: 'SELECT value FROM key_value WHERE user_id=? AND key=?', args: [USER_ID, 'my_exercises'] });
  if (!r.rows[0]) return [];
  try { return JSON.parse(String(r.rows[0].value)) as string[]; } catch { return []; }
}

export async function GET() {
  await ensureDb();
  const slugs = await getMyExerciseSlugs();
  if (slugs.length === 0) return Response.json([]);
  const client = getClient();
  const placeholders = slugs.map(() => '?').join(',');
  const r = await client.execute({ sql: `SELECT * FROM exercise WHERE slug IN (${placeholders})`, args: slugs });
  const bySlug = new Map(r.rows.map(row => [String(row.slug), row]));
  const ordered = slugs.map(s => bySlug.get(s)).filter(Boolean);
  return Response.json(ordered);
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const { action, slug } = await req.json() as { action: 'add' | 'remove'; slug: string };
  const slugs = await getMyExerciseSlugs();
  let updated: string[];
  if (action === 'add') {
    updated = slugs.includes(slug) ? slugs : [...slugs, slug];
  } else {
    updated = slugs.filter(s => s !== slug);
  }
  const client = getClient();
  await client.execute({
    sql: `INSERT OR REPLACE INTO key_value (user_id, key, value, updated_at) VALUES (?,?,?,datetime('now'))`,
    args: [USER_ID, 'my_exercises', JSON.stringify(updated)],
  });
  return Response.json({ ok: true, count: updated.length });
}
