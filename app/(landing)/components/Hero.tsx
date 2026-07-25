'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { LandingData } from '@/app/types';
import { useQuizModal } from './QuizModalProvider';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5 } }),
};

export function Hero({ data }: { data: LandingData }) {
  const { open } = useQuizModal();
  const { content } = data;

  // Кроссфейд визуализаций
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (content.images.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % content.images.length), 6000);
    return () => clearInterval(t);
  }, [content.images.length]);

  return (
    <section id="top" className="py-8 md:py-12 lg:py-16" aria-label={data.name}>
      <div className="container-x grid items-start gap-8 lg:grid-cols-[857fr_958fr] lg:items-stretch lg:gap-8">
        {/* Оффер */}
        <div className="order-2 lg:order-1">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center rounded-xs px-5 py-3 text-lg font-medium leading-none text-white md:text-2xl"
            style={{ background: 'var(--accent)' }}
          >
            {content.badge}
          </motion.p>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-3 text-3xl font-medium leading-tight text-ink md:mt-4 md:text-4xl lg:text-[47px] lg:leading-[1.25]"
          >
            {content.title}
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-3 text-xl font-medium text-ink md:text-2xl lg:text-[30px]"
          >
            {content.subtitle}
          </motion.p>

          <ul className="mt-5 flex flex-col gap-2">
            {content.features.map((f, i) => (
              <motion.li
                key={f}
                custom={3 + i}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="marker-square flex items-center gap-3 text-lg font-normal leading-snug text-ink md:text-xl lg:text-[25px]"
              >
                {f}
              </motion.li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4 sm:gap-x-16">
            {content.stats.map((s) => (
              <div key={s.label}>
                <p className="whitespace-nowrap text-lg text-muted md:text-2xl lg:text-[28px]">{s.label}</p>
                <p
                  className="mt-0.5 whitespace-nowrap text-lg font-bold md:text-2xl lg:text-[28px]"
                  style={{ color: 'var(--accent)' }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <motion.button
            type="button"
            onClick={open}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="btn btn-cta mt-6 h-16 w-full max-w-[794px] text-lg font-semibold uppercase tracking-wide md:h-20 lg:h-[95px] lg:text-[23px]"
          >
            Подобрать квартиру
          </motion.button>

          {/* Бонусы после теста */}
          <div className="mt-4 w-full max-w-[794px]">
            <p className="text-center text-sm text-muted md:text-base">Бонусы после прохождения теста:</p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {content.bonuses.map((b) => (
                <div
                  key={b.title}
                  className="relative flex min-h-[106px] items-center justify-between gap-4 rounded-xs bg-soft px-6 py-5"
                >
                  <span className="whitespace-pre-line text-lg font-medium leading-snug text-ink">
                    {b.title}
                  </span>
                  {b.image && (
                    <Image src={b.image} alt="" width={110} height={70} className="h-[70px] w-[110px] object-contain" unoptimized />
                  )}
                  {b.lock && (
                    <Image src={b.lock} alt="" width={30} height={30} className="absolute right-2 top-2 h-[30px] w-[30px]" unoptimized />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Визуализация: на мобиле фикс-пропорция; на десктопе тянется по высоте
            левой колонки — низ всегда на уровне бонусов, как в оригинале */}
        <div className="relative order-1 aspect-[958/779] overflow-hidden rounded-lg bg-soft lg:order-2 lg:aspect-auto lg:h-full">
          {content.images.map((src, i) => (
            <div
              key={src}
              className={`hero-slide ${i === active ? 'is-active' : ''}`}
              style={{ backgroundImage: `url('${src}')` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
