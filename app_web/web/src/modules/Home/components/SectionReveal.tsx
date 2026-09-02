'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionRevealProps {
  children: ReactNode;
  /** Stagger delay in ms */
  delay?: number;
  className?: string;
}

export function SectionReveal({
  children,
  delay = 0,
  className,
}: SectionRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1],
        delay: delay / 1000,
      }}
    >
      {children}
    </motion.div>
  );
}
