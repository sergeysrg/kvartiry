'use client';

import { useEffect, useState } from 'react';
import { TextInput, AddButton, SaveBar, Skeleton, useSaveState } from './ui';

type Opt = { order: number; label: string; value: string; imageUrl: string | null };
type Step = { order: number; question: string; kind: string; gain: string; options: Opt[] };

const KINDS = [
  { id: 'CARDS', label: 'Карточки (планировки)' },
  { id: 'ICONS', label: 'Иконки' },
  { id: 'LIST', label: 'Текстовые плитки' },
  { id: 'FORM', label: 'Форма (финал)' },
];

export function QuizEditor({ slug }: { slug: string }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const { status, setStatus } = useSaveState();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/quiz?site=${slug}`)
      .then((r) => r.json())
      .then((d) => setSteps((d.steps ?? []).map(normalize)))
      .finally(() => setLoading(false));
  }, [slug]);

  const patchStep = (i: number, patch: Partial<Step>) => setSteps((p) => p.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const patchOpt = (si: number, oi: number, patch: Partial<Opt>) =>
    setSteps((p) => p.map((s, idx) => (idx === si ? { ...s, options: s.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) } : s)));

  const addStep = () => setSteps((p) => [...p, { order: p.length + 1, question: 'Новый вопрос', kind: 'LIST', gain: '1%', options: [] }]);
  const removeStep = (i: number) => setSteps((p) => p.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })));
  const addOption = (si: number) =>
    setSteps((p) => p.map((s, idx) => (idx === si ? { ...s, options: [...s.options, { order: s.options.length + 1, label: 'Новый вариант', value: 'Новый вариант', imageUrl: null }] } : s)));
  const removeOption = (si: number, oi: number) =>
    setSteps((p) => p.map((s, idx) => (idx === si ? { ...s, options: s.options.filter((_, j) => j !== oi).map((o, j) => ({ ...o, order: j + 1 })) } : s)));

  const save = async () => {
    setStatus('saving');
    const payload = {
      siteSlug: slug,
      steps: steps.map((s, i) => ({
        order: i + 1,
        question: s.question,
        kind: s.kind,
        gain: s.gain,
        options: s.kind === 'FORM' ? [] : s.options.map((o, j) => ({ ...o, order: j + 1 })),
      })),
    };
    const res = await fetch('/api/quiz', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setStatus(res.ok ? 'saved' : 'error');
  };

  if (loading) return <Skeleton />;

  return (
    <div className="grid gap-4 pb-4">
      {steps.map((s, i) => (
        <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="flex h-7 items-center rounded-lg bg-zinc-900 px-2.5 text-xs font-bold text-white">Шаг {i + 1}</span>
            <select
              value={s.kind}
              onChange={(e) => patchStep(i, { kind: e.target.value })}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
            >
              {KINDS.map((k) => (
                <option key={k.id} value={k.id}>{k.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-zinc-500">
              Выгода
              <input
                value={s.gain}
                onChange={(e) => patchStep(i, { gain: e.target.value })}
                className="w-16 rounded-lg border border-zinc-300 px-2 py-2 text-sm outline-none focus:border-zinc-900"
              />
            </label>
            <button
              onClick={() => removeStep(i)}
              className="ml-auto rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Удалить шаг
            </button>
          </div>

          <TextInput value={s.question} onChange={(v) => patchStep(i, { question: v })} placeholder="Текст вопроса" />

          {s.kind !== 'FORM' && (
            <div className="mt-4 grid gap-2">
              <p className="text-sm font-medium text-zinc-600">Варианты ответа</p>
              {s.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    value={o.label}
                    onChange={(e) => patchOpt(i, oi, { label: e.target.value, value: e.target.value })}
                    className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    placeholder="Подпись варианта"
                  />
                  <input
                    value={o.imageUrl ?? ''}
                    onChange={(e) => patchOpt(i, oi, { imageUrl: e.target.value || null })}
                    className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    placeholder="URL иконки/планировки (опц.)"
                  />
                  <button
                    onClick={() => removeOption(i, oi)}
                    title="Удалить"
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <AddButton onClick={() => addOption(i)}>Добавить вариант</AddButton>
            </div>
          )}
        </div>
      ))}

      <AddButton onClick={addStep}>Добавить шаг</AddButton>
      <SaveBar status={status} onSave={save} />
    </div>
  );
}

function normalize(s: {
  order: number;
  question: string;
  kind: string;
  gain: string;
  options?: { order: number; label: string; value: string; imageUrl: string | null }[];
}): Step {
  return {
    order: s.order,
    question: s.question,
    kind: s.kind,
    gain: s.gain,
    options: (s.options ?? []).map((o) => ({ order: o.order, label: o.label, value: o.value, imageUrl: o.imageUrl })),
  };
}
