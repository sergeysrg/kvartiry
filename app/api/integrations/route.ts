import { NextResponse } from 'next/server';
import { z } from 'zod';
import { IntegrationType } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { getSession } from '@/app/lib/auth';

async function guard() {
  const s = await getSession();
  return s ? null : NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
}

// GET /api/integrations?site=slug
export async function GET(req: Request) {
  const unauth = await guard();
  if (unauth) return unauth;
  const slug = new URL(req.url).searchParams.get('site');
  if (!slug) return NextResponse.json({ ok: false, error: 'site required' }, { status: 400 });
  const site = await prisma.site.findUnique({ where: { slug }, include: { integrations: true } });
  if (!site) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, integrations: site.integrations });
}

const putSchema = z.object({
  siteSlug: z.string(),
  integrations: z.array(
    z.object({
      type: z.nativeEnum(IntegrationType),
      enabled: z.boolean(),
      config: z.record(z.string()).default({}),
    }),
  ),
});

// PUT /api/integrations
export async function PUT(req: Request) {
  const unauth = await guard();
  if (unauth) return unauth;

  const parsed = putSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });

  const { siteSlug, integrations } = parsed.data;
  const site = await prisma.site.findUnique({ where: { slug: siteSlug } });
  if (!site) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });

  await prisma.$transaction(
    integrations.map((i) =>
      prisma.integration.upsert({
        where: { siteId_type: { siteId: site.id, type: i.type } },
        update: { enabled: i.enabled, config: i.config },
        create: { siteId: site.id, type: i.type, enabled: i.enabled, config: i.config },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
