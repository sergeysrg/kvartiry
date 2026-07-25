import { NextResponse } from 'next/server';
import { z } from 'zod';
import { QuizStepKind } from '@prisma/client';
import { prisma } from '@/app/lib/db';
import { getSession } from '@/app/lib/auth';

async function guard() {
  const s = await getSession();
  return s ? null : NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
}

// GET /api/quiz?site=slug — шаги и варианты
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('site');
  if (!slug) return NextResponse.json({ ok: false, error: 'site required' }, { status: 400 });
  const site = await prisma.site.findUnique({
    where: { slug },
    include: { quizSteps: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } } },
  });
  if (!site) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, steps: site.quizSteps });
}

const stepSchema = z.object({
  order: z.number(),
  question: z.string(),
  kind: z.nativeEnum(QuizStepKind),
  gain: z.string(),
  options: z.array(
    z.object({ order: z.number(), label: z.string(), value: z.string(), imageUrl: z.string().nullable().optional() }),
  ),
});
const putSchema = z.object({ siteSlug: z.string(), steps: z.array(stepSchema) });

// PUT /api/quiz — пересобрать квиз целиком (добавление/удаление шагов и вариантов)
export async function PUT(req: Request) {
  const unauth = await guard();
  if (unauth) return unauth;

  const parsed = putSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid', issues: parsed.error.issues }, { status: 400 });

  const { siteSlug, steps } = parsed.data;
  const site = await prisma.site.findUnique({ where: { slug: siteSlug } });
  if (!site) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.quizStep.deleteMany({ where: { siteId: site.id } });
    for (const step of steps) {
      await tx.quizStep.create({
        data: {
          siteId: site.id,
          order: step.order,
          question: step.question,
          kind: step.kind,
          gain: step.gain,
          options: { create: step.options.map((o) => ({ ...o, imageUrl: o.imageUrl ?? null })) },
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
