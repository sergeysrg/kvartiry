'use client';

import { useEffect, useState } from 'react';

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

/* ---------- Карточка-секция ---------- */
export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <header className="border-b border-zinc-100 px-5 py-4 sm:px-6">
        <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
      </header>
      <div className="grid gap-5 px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

/* ---------- Подпись поля ---------- */
export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm font-medium text-zinc-700">{children}</span>
      {hint && <span className="text-xs text-zinc-400">{hint}</span>}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5';

/* ---------- Текстовое поле ---------- */
export function TextInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5">
      {label && <Label hint={hint}>{label}</Label>}
      <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5">
      {label && <Label hint={hint}>{label}</Label>}
      <textarea
        className={cn(inputCls, 'resize-y leading-relaxed')}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

/* ---------- Картинка: поле URL + превью ---------- */
export function ImageInput({
  label,
  value,
  onChange,
  placeholder = 'https://…',
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ok = /^https?:\/\//.test(value);
  return (
    <div className="grid gap-1.5">
      {label && <Label hint="URL изображения">{label}</Label>}
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          {ok ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-zinc-400">нет</span>
          )}
        </div>
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      </div>
    </div>
  );
}

/* ---------- Кнопки строк (добавить/удалить) ---------- */
function IconBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800"
    >
      {children}
    </button>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 self-start rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
    >
      <span className="text-base leading-none">＋</span> {children}
    </button>
  );
}

/* ---------- Список строк (преимущества, реквизиты, реплики) ---------- */
export function StringList({
  label,
  hint,
  items,
  onChange,
  multiline,
  addLabel = 'Добавить',
}: {
  label?: string;
  hint?: string;
  items: string[];
  onChange: (v: string[]) => void;
  multiline?: boolean;
  addLabel?: string;
}) {
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, '']);
  return (
    <div className="grid gap-2">
      {label && <Label hint={hint}>{label}</Label>}
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          {multiline ? (
            <textarea className={cn(inputCls, 'resize-y')} rows={2} value={it} onChange={(e) => set(i, e.target.value)} />
          ) : (
            <input className={inputCls} value={it} onChange={(e) => set(i, e.target.value)} />
          )}
          <IconBtn onClick={() => remove(i)} title="Удалить">✕</IconBtn>
        </div>
      ))}
      <AddButton onClick={add}>{addLabel}</AddButton>
    </div>
  );
}

/* ---------- Пары label/value (статистика) ---------- */
export function PairList({
  label,
  items,
  onChange,
  keyA = 'label',
  keyB = 'value',
  phA = 'Подпись',
  phB = 'Значение',
  addLabel = 'Добавить',
}: {
  label?: string;
  items: Record<string, string>[];
  onChange: (v: Record<string, string>[]) => void;
  keyA?: string;
  keyB?: string;
  phA?: string;
  phB?: string;
  addLabel?: string;
}) {
  const set = (i: number, k: string, v: string) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, { [keyA]: '', [keyB]: '' }]);
  return (
    <div className="grid gap-2">
      {label && <Label>{label}</Label>}
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className={inputCls} value={it[keyA] ?? ''} onChange={(e) => set(i, keyA, e.target.value)} placeholder={phA} />
          <input className={inputCls} value={it[keyB] ?? ''} onChange={(e) => set(i, keyB, e.target.value)} placeholder={phB} />
          <IconBtn onClick={() => remove(i)} title="Удалить">✕</IconBtn>
        </div>
      ))}
      <AddButton onClick={add}>{addLabel}</AddButton>
    </div>
  );
}

/* ---------- Список изображений с превью ---------- */
export function ImageList({
  label,
  items,
  onChange,
}: {
  label?: string;
  items: string[];
  onChange: (v: string[]) => void;
}) {
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, '']);
  return (
    <div className="grid gap-2">
      {label && <Label hint="URL, первый — активный кадр">{label}</Label>}
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-11 w-16 flex-none overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
            {/^https?:\/\//.test(it) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <input className={inputCls} value={it} onChange={(e) => set(i, e.target.value)} placeholder="https://…" />
          <IconBtn onClick={() => remove(i)} title="Удалить">✕</IconBtn>
        </div>
      ))}
      <AddButton onClick={add}>Добавить изображение</AddButton>
    </div>
  );
}

/* ---------- Переключатель ---------- */
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-none items-center rounded-full transition',
        checked ? 'bg-zinc-900' : 'bg-zinc-300',
      )}
    >
      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}

/* ---------- Липкая панель сохранения ---------- */
export function SaveBar({
  status,
  dirty,
  onSave,
}: {
  status: 'idle' | 'saving' | 'saved' | 'error';
  dirty?: boolean;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
      {status === 'saved' && <span className="text-sm text-emerald-600">Сохранено ✓</span>}
      {status === 'error' && <span className="text-sm text-red-600">Ошибка сохранения</span>}
      {status === 'idle' && dirty && <span className="text-sm text-amber-600">Есть несохранённые изменения</span>}
      <button
        type="button"
        onClick={onSave}
        disabled={status === 'saving'}
        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {status === 'saving' ? 'Сохраняем…' : 'Сохранить'}
      </button>
    </div>
  );
}

/* ---------- Тост ---------- */
export function useAutoDismiss(status: string, reset: () => void, ms = 2500) {
  useEffect(() => {
    if (status === 'saved' || status === 'error') {
      const t = setTimeout(reset, ms);
      return () => clearTimeout(t);
    }
  }, [status, reset, ms]);
}

export function Skeleton() {
  return (
    <div className="grid gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100/60" />
      ))}
    </div>
  );
}

/* ---------- Хук сохранения через API ---------- */
export function useSaveState() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  useAutoDismiss(status, () => setStatus('idle'));
  return { status, setStatus };
}
