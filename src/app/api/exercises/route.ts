import { NextRequest } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { getExercises } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  await ensureDb();
  const modality = req.nextUrl.searchParams.get('modality') ?? undefined;
  const exercises = await getExercises(modality);
  return Response.json(exercises);
}
