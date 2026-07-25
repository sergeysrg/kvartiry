import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/db';
import type { IntegrationConfig } from '@/app/types';

const schema = z.object({
  siteSlug: z.string().min(1),
  name: z.string().trim().min(1),
  phone: z.string().min(5),
  answers: z.record(z.string()).default({}),
});

/** Приём заявки из квиза: сохраняет Lead и пробрасывает в CRM-интеграции. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid payload' }, { status: 400 });
  }
  const { siteSlug, name, phone, answers } = parsed.data;

  const site = await prisma.site.findUnique({
    where: { slug: siteSlug },
    include: { integrations: true },
  });
  if (!site) return NextResponse.json({ ok: false, error: 'site not found' }, { status: 404 });

  const lead = await prisma.lead.create({
    data: { siteId: site.id, name, phone, answers, source: 'quiz' },
  });

  // Лог на сервере (по ТЗ — отправка данных в консоль, пока без полноценного бэкенда).
  // eslint-disable-next-line no-console
  console.log('[LEAD]', { site: siteSlug, name, phone, answers });

  // Проброс в CRM, если интеграции включены (fire-and-forget).
  await Promise.allSettled([
    forwardBitrix(site.integrations, { name, phone, answers, site: site.name }),
    forwardAmo(site.integrations, { name, phone, answers, site: site.name }),
  ]);

  return NextResponse.json({ ok: true, id: lead.id });
}

type CrmPayload = { name: string; phone: string; answers: Record<string, string>; site: string };

async function forwardBitrix(
  integrations: { type: string; enabled: boolean; config: unknown }[],
  payload: CrmPayload,
) {
  const i = integrations.find((x) => x.type === 'BITRIX24' && x.enabled);
  const cfg = i?.config as IntegrationConfig | undefined;
  if (!cfg?.webhookUrl) return;
  const url = cfg.webhookUrl.replace(/\/$/, '') + '/crm.lead.add.json';
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        TITLE: `Заявка с квиза (${payload.site})`,
        NAME: payload.name,
        PHONE: [{ VALUE: payload.phone, VALUE_TYPE: 'WORK' }],
        COMMENTS: JSON.stringify(payload.answers, null, 2),
        SOURCE_ID: 'WEB',
      },
    }),
  }).catch(() => undefined);
}

async function forwardAmo(
  integrations: { type: string; enabled: boolean; config: unknown }[],
  payload: CrmPayload,
) {
  const i = integrations.find((x) => x.type === 'AMOCRM' && x.enabled);
  const cfg = i?.config as IntegrationConfig | undefined;
  if (!cfg?.apiUrl || !cfg?.apiKey) return;
  await fetch(cfg.apiUrl.replace(/\/$/, '') + '/api/v4/leads/complex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify([
      {
        name: `Заявка с квиза (${payload.site})`,
        _embedded: {
          contacts: [{ name: payload.name, custom_fields_values: [{ field_code: 'PHONE', values: [{ value: payload.phone }] }] }],
        },
      },
    ]),
  }).catch(() => undefined);
}
