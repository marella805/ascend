import { NextRequest } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { createSession } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json();

  const { id, modality, startedAt, localDate } = body;
  if (!id || !modality || !startedAt || !localDate) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['strength', 'endurance', 'mobility'].includes(modality)) {
    return Response.json({ error: 'Invalid modality' }, { status: 400 });
  }

  await createSession({ id, modality, startedAt, localDate });
  return Response.json({ id }, { status: 201 });
}
