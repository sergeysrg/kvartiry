'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { LandingData } from '@/app/types';
import { useQuizModal } from './QuizModalProvider';

export function Header({ data }: { data: LandingData }) {
  const { open } = useQuizModal();
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 flex h-16 items-center bg-white transition-shadow duration-300 md:h-[76px] ${
        stuck ? 'shadow-header' : ''
      }`}
    >
      <div className="container-x flex items-center justify-between gap-4">
        <a href="#top" aria-label={`${data.name} — на главную`} className="flex items-center">
          {data.logoUrl ? (
            <Image
              src={data.logoUrl}
              alt={data.name}
              width={150}
              height={59}
              className="h-8 w-auto md:h-[52px]"
              priority
              unoptimized
            />
          ) : (
            <span className="text-lg font-bold">{data.name}</span>
          )}
        </a>

        <div className="flex items-center gap-4 md:gap-8">
          <a
            href={data.settings.phoneHref}
            className="hidden whitespace-nowrap text-base font-medium text-ink transition-colors hover:text-[color:var(--accent)] sm:inline"
          >
            {data.settings.phone}
          </a>
          <motion.button
            type="button"
            onClick={open}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-navy h-10 px-5 text-sm font-medium md:px-6"
          >
            Оставить заявку
          </motion.button>
        </div>
      </div>
    </header>
  );
}
