'use client';

import { useEffect, useState } from 'react';

type Row = { key: string; value: string; type: string };

const LABELS: Record<string, string> = {
  'hero.badge': 'Бейдж (метраж)',
  'hero.title': 'Заголовок',
  'hero.subtitle': 'Подзаголовок',
  'hero.features': 'Преимущества (JSON-массив строк)',
  'hero.stats': 'Статистика (JSON: [{label,value}])',
  'hero.bonuses': 'Бонусы (JSON: [{title,image,lock}])',
  'hero.images': 'Изображения слайдера (JSON-массив URL)',
  'consultant.name': 'Консультант — имя',
  'consultant.role': 'Консультант — должность',
  'consultant.photo': 'Консультант — фото (URL)',
  'consultant.quotes': 'Реплики консультанта (JSON-массив)',
  'footer.developer': 'Застройщик',
  'footer.phonePrefix': 'Префикс телефона в футере (напр. «Тел: »)',
  'footer.legal': 'Реквизиты (JSON-массив строк)',
  'footer.devLogo': 'Логотип застройщика (URL)',
};

const isImage = (k: string) => /photo|image|logo/i.test(k);

export function ContentEditor({ slug }: { slug: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/content?site=${slug}`)
      .then((r) => r.json())
      .then((d) => setRows(d.contents ?? []))
      .finally(() => setLoading(false));
  }, [slug]);

  const update = (key: string, value: string) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, value } : r)));

  const save = async () => {
    setStatus('Сохраняем…');
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteSlug: slug, items: rows.map(({ key, value }) => ({ key, value })) }),
    });
    setStatus(res.ok ? 'Сохранено ✓' : 'Ошибка сохранения');
    setTimeout(() => setStatus(null), 2500);
  };

  if (loading) return <p className="text-slate-500">Загрузка…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Редактор контента</h2>
        <SaveBar status={status} onSave={save} />
      </div>

      <div className="grid gap-5">
        {rows.map((r) => {
          const isJson = r.value.trim().startsWith('[') || r.value.trim().startsWith('{');
          return (
            <div key={r.key} className="grid gap-1.5">
              <label className="text-sm font-medium text-slate-700">{LABELS[r.key] ?? r.key}</label>
              <div className="flex gap-3">
                <textarea
                  value={r.value}
                  onChange={(e) => update(r.key, e.target.value)}
                  rows={isJson ? 4 : 2}
                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-slate-900"
                />
                {isImage(r.key) && r.value.startsWith('http') && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.value} alt="" className="h-16 w-16 flex-none rounded-lg border border-slate-200 object-contain" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <SaveBar status={status} onSave={save} />
    </div>
  );
}

export function SaveBar({ status, onSave }: { status: string | null; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3">
      {status && <span className="text-sm text-slate-500">{status}</span>}
      <button onClick={onSave} className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700">
        Сохранить
      </button>
    </div>
  );
}
