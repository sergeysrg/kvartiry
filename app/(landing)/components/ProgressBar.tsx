'use client';

import { motion } from 'framer-motion';

/** Прогресс-бар без скругления (как в оригинале). Ширина анимируется. */
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div>
      <p className="flex items-baseline gap-3 text-lg font-normal text-ink md:text-2xl">
        Готово:{' '}
        <b className="font-medium" style={{ color: 'var(--accent)' }}>
          {percent}%
        </b>
      </p>
      <div className="progress-track mt-3">
        <motion.div
          className="progress-fill"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}
