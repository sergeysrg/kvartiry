'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { QuizStep as Step } from '@/app/types';

const GRID: Record<string, string> = {
  CARDS: 'grid-cols-2 md:grid-cols-4',
  ICONS: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
  LIST: 'grid-cols-1 sm:grid-cols-3',
};

/** Шаг квиза с вариантами-радиокнопками (CARDS/ICONS/LIST). */
export function QuizStep({
  step,
  value,
  invalid,
  onSelect,
}: {
  step: Step;
  value?: string;
  invalid?: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-6 text-2xl font-normal leading-tight text-[#35363a] md:mb-8 md:text-3xl lg:text-[37px]">
        {step.question}
      </h3>

      <div
        className={`relative grid gap-4 md:gap-6 ${GRID[step.kind] ?? 'grid-cols-1'} ${
          invalid ? 'rounded-lg p-3 ring-1 ring-danger' : ''
        }`}
        role="radiogroup"
        aria-label={step.question}
      >
        {step.options.map((opt) => {
          const checked = value === opt.value;
          return (
            <motion.label
              key={opt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block cursor-pointer"
            >
              <input
                type="radio"
                name={step.name}
                value={opt.value}
                checked={checked}
                onChange={() => onSelect(opt.value)}
                className="sr-only"
              />

              {step.kind === 'CARDS' && (
                <>
                  <span
                    className={`flex aspect-square items-center justify-center rounded-lg border bg-white p-1 transition ${
                      checked ? 'border-transparent ring-2' : 'border-line'
                    }`}
                    style={checked ? { boxShadow: 'inset 0 0 0 2px var(--accent)' } : undefined}
                  >
                    {opt.imageUrl && (
                      <Image src={opt.imageUrl} alt={opt.label} width={280} height={280} className="h-full w-full object-contain" unoptimized />
                    )}
                  </span>
                  <span className="mt-3 block text-lg font-normal text-ink md:text-xl lg:text-[23px]">
                    {opt.label}
                  </span>
                </>
              )}

              {step.kind === 'ICONS' && (
                <span
                  className={`flex aspect-square flex-col items-center justify-center gap-4 rounded-lg border bg-white p-4 text-center transition ${
                    checked ? 'border-transparent' : 'border-line'
                  }`}
                  style={checked ? { boxShadow: 'inset 0 0 0 2px var(--accent)' } : undefined}
                >
                  {opt.imageUrl && (
                    <Image src={opt.imageUrl} alt="" width={80} height={80} className="h-16 w-16 flex-none object-contain md:h-20 md:w-20" unoptimized />
                  )}
                  <span className="text-base font-normal leading-snug text-ink md:text-lg lg:text-[21px]">
                    {opt.label}
                  </span>
                </span>
              )}

              {step.kind === 'LIST' && (
                <span
                  className={`flex min-h-[88px] items-center rounded-lg border bg-white px-6 py-6 transition md:min-h-[110px] ${
                    checked ? 'border-transparent' : 'border-line'
                  }`}
                  style={checked ? { boxShadow: 'inset 0 0 0 2px var(--accent)' } : undefined}
                >
                  <span className="text-lg font-normal text-ink lg:text-[23px]">{opt.label}</span>
                </span>
              )}
            </motion.label>
          );
        })}
      </div>
    </div>
  );
}
