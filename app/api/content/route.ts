import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/db';
import { getSession } from '@/app/lib/auth';

async function guard() {
  const s = await getSession();
  return s ? null : NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
}

// GET /api/content?site=slug — контент площадки
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('site');
  if (!slug) return NextResponse.json({ ok: false, error: 'site required' }, { status: 400 });
  const site = await prisma.site.findUnique({ where: { slug }, include: { contents: true } });
  if (!site) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, contents: site.contents });
}

const putSchema = z.object({
  siteSlug: z.string(),
  items: z.array(z.object({ key: z.string(), value: z.string(), type: z.string().optional() })),
});

// PUT /api/content — массовое сохранение (только для админа)
export async function PUT(req: Request) {
  const unauth = await guard();
  if (unauth) return unauth;

  const parsed = putSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });

  const { siteSlug, items } = parsed.data;
  const site = await prisma.site.findUnique({ where: { slug: siteSlug } });
  if (!site) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });

  await prisma.$transaction(
    items.map((it) =>
      prisma.content.upsert({
        where: { siteId_key: { siteId: site.id, key: it.key } },
        update: { value: it.value },
        create: { siteId: site.id, key: it.key, value: it.value },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
