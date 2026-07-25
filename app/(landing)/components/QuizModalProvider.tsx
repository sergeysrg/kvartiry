'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Ctx = { isOpen: boolean; open: () => void; close: () => void };

const QuizModalContext = createContext<Ctx | null>(null);

export function QuizModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Блокируем скролл body, пока открыта модалка.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const value = useMemo<Ctx>(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return <QuizModalContext.Provider value={value}>{children}</QuizModalContext.Provider>;
}

export function useQuizModal(): Ctx {
  const ctx = useContext(QuizModalContext);
  if (!ctx) throw new Error('useQuizModal must be used within QuizModalProvider');
  return ctx;
}
