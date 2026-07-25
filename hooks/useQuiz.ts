'use client';

import { useCallback, useMemo, useState } from 'react';
import type { QuizStep } from '@/app/types';

export type QuizState = {
  current: number;
  answers: Record<string, string>;
  done: boolean;
};

export type UseQuiz = ReturnType<typeof useQuiz>;

/**
 * Состояние и логика квиза: переходы по шагам, ответы, прогресс и «выгода».
 * Валидация форм-шага живёт в компоненте формы (react-hook-form + zod).
 */
export function useQuiz(steps: QuizStep[]) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const total = steps.length;
  const step = steps[current];
  const isLast = current === total - 1;
  const isFirst = current === 0;

  // Прогресс по завершённости текущего шага: шаг 1 из 4 → 25%.
  const progress = useMemo(
    () => (total ? Math.round(((current + 1) / total) * 100) : 0),
    [current, total],
  );

  // «Выгода» — из data-gain активного шага.
  const gain = step?.gain ?? '0%';

  const select = useCallback(
    (name: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const goNext = useCallback(() => {
    setCurrent((c) => Math.min(c + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrent(0);
    setAnswers({});
    setDone(false);
  }, []);

  const finish = useCallback(() => setDone(true), []);

  return {
    steps,
    step,
    current,
    total,
    isFirst,
    isLast,
    progress,
    gain,
    answers,
    done,
    select,
    goNext,
    goPrev,
    reset,
    finish,
  };
}
