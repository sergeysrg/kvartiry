import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/db';
import { getSession } from '@/app/lib/auth';

async function guard() {
  const s = await getSession();
  return s ? null : NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
}

// GET /api/settings?site=slug
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('site');
  if (!slug) return NextResponse.json({ ok: false, error: 'site required' }, { status: 400 });
  const site = await prisma.site.findUnique({ where: { slug }, include: { settings: true } });
  if (!site) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, settings: site.settings });
}

const putSchema = z.object({
  siteSlug: z.string(),
  phone: z.string().optional(),
  phoneHref: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  workingHours: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  socials: z.array(z.object({ type: z.string(), url: z.string() })).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

// PUT /api/settings
export async function PUT(req: Request) {
  const unauth = await guard();
  if (unauth) return unauth;

  const parsed = putSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });

  const { siteSlug, ...data } = parsed.data;
  const site = await prisma.site.findUnique({ where: { slug: siteSlug } });
  if (!site) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });

  await prisma.settings.upsert({
    where: { siteId: site.id },
    update: data,
    create: { siteId: site.id, ...data },
  });

  return NextResponse.json({ ok: true });
}
