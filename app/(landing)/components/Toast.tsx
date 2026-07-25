'use client';

import { AnimatePresence, motion } from 'framer-motion';

/** Всплывающее уведомление об ошибках валидации. */
export function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-[300] flex max-w-[calc(100vw-3rem)] items-center gap-4 rounded-lg bg-danger px-6 py-5 text-lg leading-snug text-white shadow-card"
        >
          <span>{message}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="flex-none text-2xl leading-none opacity-85 hover:opacity-100"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
