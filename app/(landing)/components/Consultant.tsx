'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import type { Consultant as ConsultantType, HeroBonus } from '@/app/types';

/** Боковая панель квиза: «выгода», бонус и карточка консультанта с репликой. */
export function Consultant({
  consultant,
  gain,
  quoteIndex,
  bonus,
  perkUnlocked,
}: {
  consultant: ConsultantType;
  gain: string;
  quoteIndex: number;
  bonus?: HeroBonus;
  perkUnlocked: boolean;
}) {
  const quote = consultant.quotes[quoteIndex] ?? consultant.quotes[0] ?? '';

  return (
    <aside className="flex flex-col rounded-lg bg-soft p-6">
      <div
        className="flex h-[86px] items-center justify-between gap-4 rounded-xs px-6 text-2xl font-bold text-white"
        style={{ background: 'var(--accent)' }}
      >
        <span>Выгода:</span>
        <motion.span key={gain} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          {gain}
        </motion.span>
      </div>

      {bonus && (
        <div className="relative mt-4 flex min-h-[120px] items-center gap-6 rounded-lg bg-white p-6 pr-20">
          {bonus.image && (
            <Image src={bonus.image} alt="" width={120} height={80} className="h-20 w-[120px] flex-none object-contain" unoptimized />
          )}
          <span className="whitespace-pre-line text-2xl font-medium leading-relaxed text-ink">
            {bonus.title}
          </span>
          {bonus.lock && !perkUnlocked && (
            <Image src={bonus.lock} alt="" width={50} height={50} className="absolute right-4 top-4 h-[50px] w-[50px]" unoptimized />
          )}
        </div>
      )}

      <div className="mt-auto pt-10">
        <div className="flex items-center gap-5">
          {consultant.photo && (
            <Image
              src={consultant.photo}
              alt={consultant.name}
              width={88}
              height={88}
              className="h-[88px] w-[88px] flex-none rounded-full object-cover"
              unoptimized
            />
          )}
          <div>
            <p className="text-[22px] font-semibold leading-tight text-ink">{consultant.name}</p>
            <p className="mt-1 text-base text-muted">{consultant.role}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={quoteIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-5 rounded-lg bg-white p-6 text-lg leading-relaxed text-body"
          >
            {quote}
          </motion.p>
        </AnimatePresence>
      </div>
    </aside>
  );
}
