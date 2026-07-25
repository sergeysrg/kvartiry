'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { LandingData } from '@/app/types';
import { useQuiz } from '@/hooks/useQuiz';
import { formatPhone, isValidPhone } from '@/app/lib/phone';
import { useQuizModal } from './QuizModalProvider';
import { QuizStep } from './QuizStep';
import { ProgressBar } from './ProgressBar';
import { Consultant } from './Consultant';
import { Toast } from './Toast';

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Обязательное поле'),
  phone: z.string().refine(isValidPhone, 'Введите корректный номер телефона'),
  policy: z.literal(true, { errorMap: () => ({ message: 'Необходимо согласие с политикой конфиденциальности' }) }),
  ads: z.boolean().optional(),
});
type LeadForm = z.infer<typeof leadSchema>;

export function QuizModal({ data }: { data: LandingData }) {
  const { isOpen, close } = useQuizModal();
  const quiz = useQuiz(data.steps);
  const [toast, setToast] = useState<string | null>(null);
  const [invalidStep, setInvalidStep] = useState(false);
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeadForm>({ resolver: zodResolver(leadSchema), defaultValues: { ads: false } });

  // Esc закрывает модалку
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (data.steps.length === 0) return null;

  const showToast = (m: string) => setToast(m);

  const handleSelect = (value: string) => {
    quiz.select(quiz.step.name, value);
    setInvalidStep(false);
    // авто-переход на следующий шаг, как в оригинале
    setTimeout(() => quiz.goNext(), 260);
  };

  const handleNext = () => {
    if (quiz.step.kind !== 'FORM' && !quiz.answers[quiz.step.name]) {
      setInvalidStep(true);
      showToast('Пожалуйста, заполните все обязательные поля');
      return;
    }
    quiz.goNext();
  };

  const onValid = async (form: LeadForm) => {
    setSending(true);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteSlug: data.slug,
          name: form.name,
          phone: form.phone,
          answers: quiz.answers,
        }),
      });
      // Пока без бэкенда данные всё равно логируются на сервере и в консоли клиента.
      // eslint-disable-next-line no-console
      console.log('Заявка отправлена:', { site: data.slug, ...form, answers: quiz.answers });
      if (!res.ok) throw new Error('request failed');
      quiz.finish();
    } catch {
      showToast('Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      setSending(false);
    }
  };

  const onInvalid = () => showToast('Пожалуйста, заполните все обязательные поля');

  const currentBonus = data.content.bonuses[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6" role="dialog" aria-modal="true" aria-label="Подбор квартиры">
          <motion.div
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.div
            className="relative z-10 max-h-[92vh] w-full max-w-[1500px] overflow-y-auto rounded-lg bg-white p-5 pt-14 shadow-card md:p-8 md:pt-16"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-2xl text-muted transition-colors hover:bg-soft hover:text-ink"
            >
              ×
            </button>

            <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_551px]">
              {/* Основная колонка */}
              <div className="flex min-h-[500px] flex-col lg:min-h-[763px]">
                {quiz.done ? (
                  <SuccessScreen onClose={close} />
                ) : (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={quiz.current}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      >
                        {quiz.step.kind === 'FORM' ? (
                          <FormStep
                            question={quiz.step.question}
                            register={register}
                            errors={errors}
                            onPhone={(v) => setValue('phone', formatPhone(v))}
                            phoneValue={watch('phone') ?? ''}
                          />
                        ) : (
                          <QuizStep
                            step={quiz.step}
                            value={quiz.answers[quiz.step.name]}
                            invalid={invalidStep}
                            onSelect={handleSelect}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Навигация + прогресс */}
                    <div className="mt-auto flex flex-wrap items-end gap-3 pt-10">
                      <div className="mr-auto min-w-0 flex-1">
                        <ProgressBar percent={quiz.progress} />
                      </div>
                      <button
                        type="button"
                        onClick={quiz.goPrev}
                        disabled={quiz.isFirst}
                        aria-label="Назад"
                        className="flex h-[62px] w-[62px] flex-none items-center justify-center rounded-full border border-[#d8d8dc] bg-white text-2xl text-[#838a9a] transition hover:border-[#838a9a] hover:text-ink disabled:pointer-events-none disabled:opacity-40 md:h-[78px] md:w-[78px]"
                      >
                        ←
                      </button>
                      {quiz.isLast ? (
                        <motion.button
                          type="button"
                          onClick={handleSubmit(onValid, onInvalid)}
                          disabled={sending}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="btn btn-navy h-[62px] flex-none px-8 text-lg md:h-[78px] lg:text-[23px]"
                        >
                          {sending ? 'Отправляем…' : 'Получить подборку'}
                        </motion.button>
                      ) : (
                        <motion.button
                          type="button"
                          onClick={handleNext}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="btn btn-navy h-[62px] flex-none px-8 text-lg md:h-[78px] lg:text-[23px]"
                        >
                          Далее →
                        </motion.button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Боковая панель */}
              <Consultant
                consultant={data.content.consultant}
                gain={quiz.gain}
                quoteIndex={quiz.current}
                bonus={currentBonus}
                perkUnlocked={quiz.isLast}
              />
            </div>
          </motion.div>

          <Toast message={toast} onClose={() => setToast(null)} />
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Финальный шаг: форма ---------- */
function FormStep({
  question,
  register,
  errors,
  onPhone,
  phoneValue,
}: {
  question: string;
  register: ReturnType<typeof useForm<LeadForm>>['register'];
  errors: ReturnType<typeof useForm<LeadForm>>['formState']['errors'];
  onPhone: (v: string) => void;
  phoneValue: string;
}) {
  const phoneReg = register('phone');
  return (
    <div>
      <h3 className="mb-6 text-2xl font-normal leading-tight text-[#35363a] md:text-3xl lg:text-[37px]">
        {question}
      </h3>

      <div className="grid max-w-[960px] gap-4">
        <div className="flex flex-col gap-2">
          <label className="visually-hidden" htmlFor="fName">Ваше имя</label>
          <input
            id="fName"
            type="text"
            placeholder="Ваше имя"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register('name')}
            className={`h-[76px] w-full rounded-lg border bg-soft px-6 text-xl transition placeholder:text-[#8f93a1] focus:bg-white focus:outline-none ${
              errors.name ? 'border-danger bg-[#fff5f3]' : 'border-transparent focus:border-[color:var(--accent)]'
            }`}
          />
          {errors.name && <span className="text-base text-danger">{errors.name.message}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="visually-hidden" htmlFor="fPhone">Телефон</label>
          <input
            id="fPhone"
            type="tel"
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            name={phoneReg.name}
            ref={phoneReg.ref}
            onBlur={phoneReg.onBlur}
            value={phoneValue}
            onChange={(e) => onPhone(e.target.value)}
            onFocus={(e) => { if (!e.target.value) onPhone('+7 '); }}
            className={`h-[76px] w-full rounded-lg border bg-soft px-6 text-xl transition placeholder:text-[#8f93a1] focus:bg-white focus:outline-none ${
              errors.phone ? 'border-danger bg-[#fff5f3]' : 'border-transparent focus:border-[color:var(--accent)]'
            }`}
          />
          {errors.phone && <span className="text-base text-danger">{errors.phone.message}</span>}
        </div>

        <label className="flex items-start gap-3 text-base leading-relaxed text-muted">
          <input type="checkbox" {...register('policy')} className="mt-1 h-5 w-5 flex-none" style={{ accentColor: 'var(--accent)' }} />
          <span>
            Согласие с <span className="text-body underline">политикой конфиденциальности</span>
          </span>
        </label>
        {errors.policy && <span className="text-base text-danger">{errors.policy.message}</span>}

        <label className="flex items-start gap-3 text-base leading-relaxed text-muted">
          <input type="checkbox" {...register('ads')} className="mt-1 h-5 w-5 flex-none" style={{ accentColor: 'var(--accent)' }} />
          <span>
            Согласие на <span className="text-body underline">получение рекламных рассылок</span>
          </span>
        </label>
      </div>
    </div>
  );
}

/* ---------- Экран «Спасибо» ---------- */
function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start gap-6"
    >
      <div
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-3xl text-white"
        style={{ background: 'var(--accent)' }}
      >
        ✓
      </div>
      <h3 className="text-3xl font-medium lg:text-[37px]">Заявка отправлена</h3>
      <p className="max-w-[70ch] text-xl text-body">
        Мы свяжемся с вами в ближайшее время и пришлём подборку квартир с ценами по выбранным параметрам.
      </p>
      <button type="button" onClick={onClose} className="btn btn-accent h-[78px] px-9 text-lg lg:text-[23px]">
        Хорошо
      </button>
    </motion.div>
  );
}
