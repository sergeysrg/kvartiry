'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  SectionCard,
  TextInput,
  TextArea,
  ImageInput,
  ImageList,
  StringList,
  PairList,
  Label,
  AddButton,
  SaveBar,
  Skeleton,
  useSaveState,
} from './ui';

type FieldType = 'text' | 'textarea' | 'image' | 'list' | 'list-multiline' | 'stats' | 'bonuses' | 'images';
type Field = { key: string; label: string; type: FieldType; hint?: string };
type Section = { title: string; description?: string; fields: Field[] };

const SECTIONS: Section[] = [
  {
    title: 'Герой',
    description: 'Первый экран: заголовок, преимущества, статистика, бонусы и слайдер.',
    fields: [
      { key: 'hero.badge', label: 'Бейдж (метраж)', type: 'text' },
      { key: 'hero.title', label: 'Заголовок', type: 'textarea' },
      { key: 'hero.subtitle', label: 'Подзаголовок', type: 'text' },
      { key: 'hero.features', label: 'Преимущества', type: 'list' },
      { key: 'hero.stats', label: 'Статистика', type: 'stats' },
      { key: 'hero.bonuses', label: 'Бонусы после теста', type: 'bonuses' },
      { key: 'hero.images', label: 'Изображения слайдера', type: 'images' },
    ],
  },
  {
    title: 'Консультант',
    description: 'Карточка менеджера в боковой панели квиза.',
    fields: [
      { key: 'consultant.name', label: 'Имя', type: 'text' },
      { key: 'consultant.role', label: 'Должность', type: 'text' },
      { key: 'consultant.photo', label: 'Фото', type: 'image' },
      { key: 'consultant.quotes', label: 'Реплики (по шагам квиза)', type: 'list-multiline' },
    ],
  },
  {
    title: 'Подвал',
    description: 'Реквизиты и застройщик.',
    fields: [
      { key: 'footer.developer', label: 'Застройщик', type: 'textarea' },
      { key: 'footer.phonePrefix', label: 'Префикс телефона в футере', type: 'text', hint: 'напр. «Тел: » или пусто' },
      { key: 'footer.legal', label: 'Реквизиты', type: 'list' },
      { key: 'footer.devLogo', label: 'Логотип застройщика', type: 'image' },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);
const isText = (t: FieldType) => t === 'text' || t === 'textarea' || t === 'image';

function parseValue(type: FieldType, raw: string | undefined): unknown {
  if (isText(type)) return raw ?? '';
  try {
    return JSON.parse(raw ?? '');
  } catch {
    return [];
  }
}
function serialize(type: FieldType, val: unknown): string {
  return isText(type) ? String(val ?? '') : JSON.stringify(val ?? []);
}

type Bonus = { title: string; image: string; lock?: string };

export function ContentEditor({ slug }: { slug: string }) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [extra, setExtra] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { status, setStatus } = useSaveState();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/content?site=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        const rows: { key: string; value: string }[] = d.contents ?? [];
        const byKey = new Map(rows.map((r) => [r.key, r.value]));
        const v: Record<string, unknown> = {};
        for (const f of ALL_FIELDS) v[f.key] = parseValue(f.type, byKey.get(f.key));
        setValues(v);
        setExtra(rows.filter((r) => !ALL_FIELDS.some((f) => f.key === r.key)));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const set = (key: string, val: unknown) => setValues((p) => ({ ...p, [key]: val }));

  const save = async () => {
    setStatus('saving');
    const items = [
      ...ALL_FIELDS.map((f) => ({ key: f.key, value: serialize(f.type, values[f.key]) })),
      ...extra,
    ];
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteSlug: slug, items }),
    });
    setStatus(res.ok ? 'saved' : 'error');
  };

  if (loading) return <Skeleton />;

  return (
    <div className="grid gap-6 pb-4">
      {SECTIONS.map((section) => (
        <SectionCard key={section.title} title={section.title} description={section.description}>
          {section.fields.map((f) => (
            <FieldEditor key={f.key} field={f} value={values[f.key]} onChange={(v) => set(f.key, v)} />
          ))}
        </SectionCard>
      ))}
      <SaveBar status={status} onSave={save} />
    </div>
  );
}

function FieldEditor({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case 'text':
      return <TextInput label={field.label} hint={field.hint} value={(value as string) ?? ''} onChange={onChange} />;
    case 'textarea':
      return <TextArea label={field.label} hint={field.hint} value={(value as string) ?? ''} onChange={onChange} rows={2} />;
    case 'image':
      return <ImageInput label={field.label} value={(value as string) ?? ''} onChange={onChange} />;
    case 'list':
      return <StringList label={field.label} hint={field.hint} items={(value as string[]) ?? []} onChange={onChange} addLabel="Добавить пункт" />;
    case 'list-multiline':
      return <StringList label={field.label} items={(value as string[]) ?? []} onChange={onChange} multiline addLabel="Добавить реплику" />;
    case 'stats':
      return <PairList label={field.label} items={(value as Record<string, string>[]) ?? []} onChange={onChange} phA="Подпись (напр. Сдача)" phB="Значение (напр. 2027 г.)" addLabel="Добавить показатель" />;
    case 'images':
      return <ImageList label={field.label} items={(value as string[]) ?? []} onChange={onChange} />;
    case 'bonuses':
      return <BonusesEditor label={field.label} items={(value as Bonus[]) ?? []} onChange={onChange} />;
    default:
      return null;
  }
}

/* ---------- Редактор бонусов (карточки) ---------- */
function BonusesEditor({ label, items, onChange }: { label: string; items: Bonus[]; onChange: (v: Bonus[]) => void }) {
  const set = (i: number, patch: Partial<Bonus>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, { title: '', image: '', lock: '' }]);
  return (
    <div className="grid gap-3">
      <Label hint="карточки под кнопкой">{label}</Label>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((b, i) => (
          <div key={i} className="relative rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
            <button
              type="button"
              onClick={() => remove(i)}
              title="Удалить"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-white hover:text-zinc-700"
            >
              ✕
            </button>
            <div className="grid gap-3">
              <TextArea label="Текст" value={b.title} onChange={(v) => set(i, { title: v })} rows={2} placeholder="Подборка бесплатно" />
              <ImageInput label="Картинка" value={b.image} onChange={(v) => set(i, { image: v })} />
              <ImageInput label="Иконка замка" value={b.lock ?? ''} onChange={(v) => set(i, { lock: v })} />
            </div>
          </div>
        ))}
      </div>
      <AddButton onClick={add}>Добавить бонус</AddButton>
    </div>
  );
}
