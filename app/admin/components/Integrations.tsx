'use client';

import { useEffect, useState } from 'react';
import { SaveBar } from './ContentEditor';

type Integration = { type: string; enabled: boolean; config: Record<string, string> };

const META: Record<string, { title: string; fields: { key: string; label: string; placeholder: string }[] }> = {
  YANDEX_METRIKA: { title: 'Яндекс.Метрика', fields: [{ key: 'counterId', label: 'ID счётчика', placeholder: '12345678' }] },
  YANDEX_WEBMASTER: { title: 'Яндекс.Вебмастер', fields: [{ key: 'verification', label: 'Verification-код', placeholder: 'a1b2c3d4e5' }] },
  BITRIX24: { title: 'Битрикс24', fields: [{ key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://xxx.bitrix24.ru/rest/1/token' }] },
  AMOCRM: {
    title: 'amoCRM',
    fields: [
      { key: 'apiUrl', label: 'API URL', placeholder: 'https://xxx.amocrm.ru' },
      { key: 'apiKey', label: 'Access token', placeholder: 'eyJ0eXAi...' },
    ],
  },
  GOOGLE_ANALYTICS: { title: 'Google Analytics 4', fields: [{ key: 'measurementId', label: 'Measurement ID', placeholder: 'G-XXXXXXX' }] },
};

const ORDER = ['YANDEX_METRIKA', 'YANDEX_WEBMASTER', 'BITRIX24', 'AMOCRM', 'GOOGLE_ANALYTICS'];

export function Integrations({ slug }: { slug: string }) {
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

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

  const toggle = (type: string, enabled: boolean) =>
    setItems((prev) => prev.map((i) => (i.type === type ? { ...i, enabled } : i)));

  const setField = (type: string, key: string, value: string) =>
    setItems((prev) => prev.map((i) => (i.type === type ? { ...i, config: { ...i.config, [key]: value } } : i)));

  const save = async () => {
    setStatus('Сохраняем…');
    const res = await fetch('/api/integrations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteSlug: slug, integrations: items }),
    });
    setStatus(res.ok ? 'Сохранено ✓' : 'Ошибка сохранения');
    setTimeout(() => setStatus(null), 2500);
  };

  if (loading) return <p className="text-slate-500">Загрузка…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Интеграции</h2>
        <SaveBar status={status} onSave={save} />
      </div>

      <div className="grid gap-4">
        {items.map((it) => {
          const meta = META[it.type];
          if (!meta) return null;
          return (
            <div key={it.type} className={`rounded-xl border p-4 transition ${it.enabled ? 'border-slate-900' : 'border-slate-200'}`}>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="font-semibold">{meta.title}</span>
                <span className="relative inline-flex h-6 w-11 items-center">
                  <input
                    type="checkbox"
                    checked={it.enabled}
                    onChange={(e) => toggle(it.type, e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-slate-900" />
                  <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                </span>
              </label>

              {it.enabled && (
                <div className="mt-3 grid gap-3">
                  {meta.fields.map((f) => (
                    <label key={f.key} className="grid gap-1 text-sm">
                      <span className="text-slate-600">{f.label}</span>
                      <input
                        value={it.config[f.key] ?? ''}
                        onChange={(e) => setField(it.type, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SaveBar status={status} onSave={save} />
    </div>
  );
}
