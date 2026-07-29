import { ensureDb } from '@/lib/db/index';
import { getPRs } from '@/lib/db/queries';

export async function GET() {
  await ensureDb();
  return Response.json(await getPRs());
}
