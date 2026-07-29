import { NextRequest } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { addSet } from '@/lib/db/queries';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDb();
  const { id: sessionId } = await params;
  const body = await req.json();

  const {
    id, exerciseId, setIndex,
    weightKg, reps, durationS, distanceM, rpe, isWarmup,
  } = body;

  if (!id || !exerciseId || setIndex === undefined) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await addSet({ id, sessionId, exerciseId, setIndex, weightKg, reps, durationS, distanceM, rpe, isWarmup });
  return Response.json({ ok: true }, { status: 201 });
}
