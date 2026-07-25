'use client';

import { useEffect, useState } from 'react';
import { SaveBar } from './ContentEditor';

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
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/quiz?site=${slug}`)
      .then((r) => r.json())
      .then((d) => setSteps((d.steps ?? []).map(normalize))
      )
      .finally(() => setLoading(false));
  }, [slug]);

  const patchStep = (i: number, patch: Partial<Step>) =>
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const patchOpt = (si: number, oi: number, patch: Partial<Opt>) =>
    setSteps((prev) =>
      prev.map((s, idx) =>
        idx === si ? { ...s, options: s.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) } : s,
      ),
    );

  const addStep = () =>
    setSteps((prev) => [
      ...prev,
      { order: prev.length + 1, question: 'Новый вопрос', kind: 'LIST', gain: '1%', options: [] },
    ]);

  const removeStep = (i: number) =>
    setSteps((prev) => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })));

  const addOption = (si: number) =>
    setSteps((prev) =>
      prev.map((s, idx) =>
        idx === si
          ? { ...s, options: [...s.options, { order: s.options.length + 1, label: 'Новый вариант', value: 'Новый вариант', imageUrl: null }] }
          : s,
      ),
    );

  const removeOption = (si: number, oi: number) =>
    setSteps((prev) =>
      prev.map((s, idx) =>
        idx === si ? { ...s, options: s.options.filter((_, j) => j !== oi).map((o, j) => ({ ...o, order: j + 1 })) } : s,
      ),
    );

  const save = async () => {
    setStatus('Сохраняем…');
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
    const res = await fetch('/api/quiz', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setStatus(res.ok ? 'Сохранено ✓' : 'Ошибка сохранения');
    setTimeout(() => setStatus(null), 2500);
  };

  if (loading) return <p className="text-slate-500">Загрузка…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Редактор квиза</h2>
        <SaveBar status={status} onSave={save} />
      </div>

      <div className="space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-slate-900 px-2 py-1 text-xs font-bold text-white">Шаг {i + 1}</span>
              <select
                value={s.kind}
                onChange={(e) => patchStep(i, { kind: e.target.value })}
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              >
                {KINDS.map((k) => (
                  <option key={k.id} value={k.id}>{k.label}</option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-sm text-slate-500">
                Выгода:
                <input
                  value={s.gain}
                  onChange={(e) => patchStep(i, { gain: e.target.value })}
                  className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                />
              </label>
              <button onClick={() => removeStep(i)} className="ml-auto rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                Удалить шаг
              </button>
            </div>

            <input
              value={s.question}
              onChange={(e) => patchStep(i, { question: e.target.value })}
              className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 font-medium outline-none focus:border-slate-900"
              placeholder="Текст вопроса"
            />

            {s.kind !== 'FORM' && (
              <div className="space-y-2">
                {s.options.map((o, oi) => (
                  <div key={oi} className="flex flex-wrap items-center gap-2">
                    <input
                      value={o.label}
                      onChange={(e) => patchOpt(i, oi, { label: e.target.value, value: e.target.value })}
                      className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                      placeholder="Подпись варианта"
                    />
                    <input
                      value={o.imageUrl ?? ''}
                      onChange={(e) => patchOpt(i, oi, { imageUrl: e.target.value || null })}
                      className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                      placeholder="URL иконки/планировки (опц.)"
                    />
                    <button onClick={() => removeOption(i, oi)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
                      ✕
                    </button>
                  </div>
                ))}
                <button onClick={() => addOption(i)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100">
                  + Добавить вариант
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={addStep} className="rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
        + Добавить шаг
      </button>

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
