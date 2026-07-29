import { NextRequest } from 'next/server';
import { ensureDb } from '@/lib/db/index';
import { getTemplateState, saveTemplateState } from '@/lib/db/queries';
import type { TemplateKey } from '@/lib/templates';

export async function GET() {
  await ensureDb();
  return Response.json(await getTemplateState());
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json();
  const { templateKey } = body as { templateKey: TemplateKey };
  if (!templateKey) return Response.json({ error: 'Missing templateKey' }, { status: 400 });
  await saveTemplateState(templateKey);
  return Response.json({ ok: true });
}
