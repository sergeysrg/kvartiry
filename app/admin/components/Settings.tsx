'use client';

import { useEffect, useState } from 'react';
import { SaveBar } from './ContentEditor';

type SettingsData = {
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  workingHours: { label: string; value: string }[];
  socials: { type: string; url: string }[];
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
};

const EMPTY: SettingsData = {
  phone: '', phoneHref: '', email: '', address: '',
  workingHours: [], socials: [], metaTitle: '', metaDescription: '', ogImage: '',
};

export function Settings({ slug }: { slug: string }) {
  const [data, setData] = useState<SettingsData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/settings?site=${slug}`)
      .then((r) => r.json())
      .then((d) => setData({ ...EMPTY, ...(d.settings ?? {}) }))
      .finally(() => setLoading(false));
  }, [slug]);

  const set = <K extends keyof SettingsData>(k: K, v: SettingsData[K]) => setData((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setStatus('Сохраняем…');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteSlug: slug, ...data }),
    });
    setStatus(res.ok ? 'Сохранено ✓' : 'Ошибка сохранения');
    setTimeout(() => setStatus(null), 2500);
  };

  if (loading) return <p className="text-slate-500">Загрузка…</p>;

  const field = (label: string, key: keyof SettingsData, placeholder = '') => (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-600">{label}</span>
      <input
        value={String(data[key] ?? '')}
        onChange={(e) => set(key, e.target.value as never)}
        placeholder={placeholder}
        className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
      />
    </label>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Настройки площадки</h2>
        <SaveBar status={status} onSave={save} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {field('Телефон', 'phone', '+7 843 000-00-00')}
        {field('Телефон (href)', 'phoneHref', 'tel:+78430000000')}
        {field('Email', 'email', 'sale@example.com')}
        {field('Адрес', 'address', 'г. Казань, ул. …')}
        {field('OG-изображение (URL)', 'ogImage')}
        {field('Meta title', 'metaTitle')}
      </div>

      <label className="grid gap-1 text-sm">
        <span className="text-slate-600">Meta description</span>
        <textarea
          value={data.metaDescription}
          onChange={(e) => set('metaDescription', e.target.value)}
          rows={3}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
        />
      </label>

      <div className="grid gap-3">
        <span className="text-sm font-medium text-slate-600">Режим работы</span>
        {data.workingHours.map((h, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={h.label}
              onChange={(e) => set('workingHours', data.workingHours.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="ПН-ПТ"
            />
            <input
              value={h.value}
              onChange={(e) => set('workingHours', data.workingHours.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="09:00 — 20:00"
            />
            <button
              onClick={() => set('workingHours', data.workingHours.filter((_, j) => j !== i))}
              className="rounded-lg border border-slate-300 px-2 text-slate-500 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => set('workingHours', [...data.workingHours, { label: '', value: '' }])}
          className="justify-self-start rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
        >
          + Добавить строку
        </button>
      </div>

      <SaveBar status={status} onSave={save} />
    </div>
  );
}
