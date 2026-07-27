'use client';

import { useEffect, useState } from 'react';
import { SectionCard, TextInput, TextArea, ImageInput, PairList, SaveBar, Skeleton, useSaveState } from './ui';

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
  const { status, setStatus } = useSaveState();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/settings?site=${slug}`)
      .then((r) => r.json())
      .then((d) => setData({ ...EMPTY, ...(d.settings ?? {}) }))
      .finally(() => setLoading(false));
  }, [slug]);

  const set = <K extends keyof SettingsData>(k: K, v: SettingsData[K]) => setData((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setStatus('saving');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteSlug: slug, ...data }),
    });
    setStatus(res.ok ? 'saved' : 'error');
  };

  if (loading) return <Skeleton />;

  return (
    <div className="grid gap-6 pb-4">
      <SectionCard title="Контакты" description="Телефон, почта и адрес офиса продаж.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput label="Телефон" value={data.phone} onChange={(v) => set('phone', v)} placeholder="+7 843 000-00-00" />
          <TextInput label="Телефон (ссылка tel:)" value={data.phoneHref} onChange={(v) => set('phoneHref', v)} placeholder="tel:+78430000000" />
          <TextInput label="Email" value={data.email} onChange={(v) => set('email', v)} placeholder="sale@example.com" />
          <TextInput label="Адрес" value={data.address} onChange={(v) => set('address', v)} placeholder="г. Казань, ул. …" />
        </div>
      </SectionCard>

      <SectionCard title="Режим работы" description="Строки вида «ПН-ПТ» — «09:00 — 20:00».">
        <PairList
          items={data.workingHours}
          onChange={(v) => set('workingHours', v as { label: string; value: string }[])}
          phA="ПН-ПТ"
          phB="09:00 — 20:00"
          addLabel="Добавить строку"
        />
      </SectionCard>

      <SectionCard title="SEO и мета" description="Заголовок, описание и картинка для соцсетей.">
        <TextInput label="Meta title" value={data.metaTitle} onChange={(v) => set('metaTitle', v)} />
        <TextArea label="Meta description" value={data.metaDescription} onChange={(v) => set('metaDescription', v)} rows={3} />
        <ImageInput label="OG-изображение (для соцсетей)" value={data.ogImage} onChange={(v) => set('ogImage', v)} />
      </SectionCard>

      <SaveBar status={status} onSave={save} />
    </div>
  );
}
