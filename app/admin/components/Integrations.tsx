'use client';

import { useEffect, useState } from 'react';
import { TextInput, Toggle, SaveBar, Skeleton, useSaveState, cn } from './ui';

type Integration = { type: string; enabled: boolean; config: Record<string, string> };

const META: Record<
  string,
  { title: string; desc: string; icon: string; fields: { key: string; label: string; placeholder: string }[] }
> = {
  YANDEX_METRIKA: { title: 'Яндекс.Метрика', desc: 'Счётчик посещаемости', icon: '📊', fields: [{ key: 'counterId', label: 'ID счётчика', placeholder: '12345678' }] },
  YANDEX_WEBMASTER: { title: 'Яндекс.Вебмастер', desc: 'Подтверждение прав на сайт', icon: '🔎', fields: [{ key: 'verification', label: 'Verification-код', placeholder: 'a1b2c3d4e5' }] },
  BITRIX24: { title: 'Битрикс24', desc: 'Заявки уходят в CRM', icon: '🟦', fields: [{ key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://xxx.bitrix24.ru/rest/1/token' }] },
  AMOCRM: {
    title: 'amoCRM',
    desc: 'Заявки уходят в CRM',
    icon: '🟩',
    fields: [
      { key: 'apiUrl', label: 'API URL', placeholder: 'https://xxx.amocrm.ru' },
      { key: 'apiKey', label: 'Access token', placeholder: 'eyJ0eXAi…' },
    ],
  },
  GOOGLE_ANALYTICS: { title: 'Google Analytics 4', desc: 'Веб-аналитика', icon: '📈', fields: [{ key: 'measurementId', label: 'Measurement ID', placeholder: 'G-XXXXXXX' }] },
};

const ORDER = ['YANDEX_METRIKA', 'YANDEX_WEBMASTER', 'BITRIX24', 'AMOCRM', 'GOOGLE_ANALYTICS'];

export function Integrations({ slug }: { slug: string }) {
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const { status, setStatus } = useSaveState();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/integrations?site=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        const existing: Integration[] = (d.integrations ?? []).map((i: Integration) => ({
          type: i.type,
          enabled: i.enabled,
          config: (i.config as Record<string, string>) ?? {},
        }));
        const byType = new Map(existing.map((i) => [i.type, i]));
        setItems(ORDER.map((t) => byType.get(t) ?? { type: t, enabled: false, config: {} }));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const toggle = (type: string, enabled: boolean) => setItems((p) => p.map((i) => (i.type === type ? { ...i, enabled } : i)));
  const setField = (type: string, key: string, value: string) =>
    setItems((p) => p.map((i) => (i.type === type ? { ...i, config: { ...i.config, [key]: value } } : i)));

  const save = async () => {
    setStatus('saving');
    const res = await fetch('/api/integrations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteSlug: slug, integrations: items }),
    });
    setStatus(res.ok ? 'saved' : 'error');
  };

  if (loading) return <Skeleton />;

  return (
    <div className="grid gap-4 pb-4">
      {items.map((it) => {
        const meta = META[it.type];
        if (!meta) return null;
        return (
          <div
            key={it.type}
            className={cn(
              'rounded-2xl border bg-white p-5 shadow-sm transition',
              it.enabled ? 'border-zinc-900/20 ring-1 ring-zinc-900/5' : 'border-zinc-200',
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-zinc-100 text-xl">{meta.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-zinc-900">{meta.title}</p>
                <p className="text-sm text-zinc-500">{meta.desc}</p>
              </div>
              <Toggle checked={it.enabled} onChange={(v) => toggle(it.type, v)} />
            </div>
            {it.enabled && (
              <div className="mt-4 grid gap-4 border-t border-zinc-100 pt-4 sm:grid-cols-2">
                {meta.fields.map((f) => (
                  <TextInput key={f.key} label={f.label} value={it.config[f.key] ?? ''} onChange={(v) => setField(it.type, f.key, v)} placeholder={f.placeholder} />
                ))}
              </div>
            )}
          </div>
        );
      })}
      <SaveBar status={status} onSave={save} />
    </div>
  );
}
