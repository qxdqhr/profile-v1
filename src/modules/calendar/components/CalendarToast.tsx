'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CalendarToastProps {
  message: string | null;
  variant?: 'success' | 'error';
}

export default function CalendarToast({
  message,
  variant = 'success',
}: CalendarToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className={`fixed bottom-6 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            variant === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-slate-900 text-white'
          }`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
