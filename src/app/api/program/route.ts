import { NextRequest } from 'next/server';
import { ensureDb, getClient } from '@/lib/db/index';
import { PROGRAMS, getProgramByKey, type ProgramDay } from '@/lib/program-splits';

const USER_ID = 'demo-user-001';

type ActiveProgram = { split: string; dayIndex: number; customDays: Record<string, string[]> };

async function getActiveProgram(): Promise<ActiveProgram | null> {
  const client = getClient();
  const r = await client.execute({ sql: 'SELECT value FROM key_value WHERE user_id=? AND key=?', args: [USER_ID, 'active_program'] });
  if (!r.rows[0]) return null;
  try { return JSON.parse(String(r.rows[0].value)) as ActiveProgram; } catch { return null; }
}

async function saveActiveProgram(prog: ActiveProgram): Promise<void> {
  const client = getClient();
  await client.execute({
    sql: `INSERT OR REPLACE INTO key_value (user_id, key, value, updated_at) VALUES (?,?,?,datetime('now'))`,
    args: [USER_ID, 'active_program', JSON.stringify(prog)],
  });
}

function resolveDay(prog: ActiveProgram): ProgramDay | null {
  const def = getProgramByKey(prog.split);
  if (!def) return null;
  const idx = prog.dayIndex % def.days.length;
  const dayDef = def.days[idx];
  const custom = prog.customDays[String(idx)];
  if (!custom) return dayDef;
  return { ...dayDef, exercises: dayDef.exercises.filter(e => custom.includes(e.slug)) };
}

export async function GET() {
  await ensureDb();
  const prog = await getActiveProgram();
  if (!prog) return Response.json({ active: false });
  const def = getProgramByKey(prog.split);
  if (!def) return Response.json({ active: false });
  const idx = prog.dayIndex % def.days.length;
  const day = resolveDay(prog);
  return Response.json({ active: true, split: prog.split, dayIndex: prog.dayIndex, cycleDay: idx, day, totalDays: def.days.length, programs: PROGRAMS.map(p => ({ key: p.key, label: p.label, shortLabel: p.shortLabel, color: p.color, totalDays: p.days.length })) });
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json() as { action: 'set' | 'advance' | 'customize'; split?: string; daySlot?: number; slugs?: string[] };

  if (body.action === 'set') {
    if (!body.split || !getProgramByKey(body.split)) return Response.json({ ok: false, error: 'invalid split' }, { status: 400 });
    await saveActiveProgram({ split: body.split, dayIndex: 0, customDays: {} });
    return Response.json({ ok: true });
  }

  if (body.action === 'advance') {
    const prog = await getActiveProgram();
    if (!prog) return Response.json({ ok: false, error: 'no active program' }, { status: 400 });
    await saveActiveProgram({ ...prog, dayIndex: prog.dayIndex + 1 });
    return Response.json({ ok: true });
  }

  if (body.action === 'customize') {
    const prog = await getActiveProgram();
    if (!prog) return Response.json({ ok: false, error: 'no active program' }, { status: 400 });
    const slot = body.daySlot ?? (prog.dayIndex % (getProgramByKey(prog.split)?.days.length ?? 1));
    const customDays = { ...prog.customDays, [String(slot)]: body.slugs ?? [] };
    await saveActiveProgram({ ...prog, customDays });
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false, error: 'unknown action' }, { status: 400 });
}
