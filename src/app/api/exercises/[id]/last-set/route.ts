import { NextRequest } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { getLastBestSet } from '@/lib/db/queries';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const result = await getLastBestSet(id);
  if (!result) return Response.json(null);
  return Response.json(result);
}
