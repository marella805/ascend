import { NextRequest } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { finishSession } from '@/lib/db/queries';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDb();
  const { id: sessionId } = await params;
  const body = await req.json();
  const { localDate } = body;

  if (!localDate) {
    return Response.json({ error: 'localDate required' }, { status: 400 });
  }

  const envelope = await finishSession(sessionId, localDate);
  return Response.json(envelope);
}
