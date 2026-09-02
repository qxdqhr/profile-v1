'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionRevealV2Props {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function SectionRevealV2({
  children,
  delay = 0,
  className,
}: SectionRevealV2Props) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{
        duration: 0.28,
        ease: [0.4, 0, 0.2, 1],
        delay: delay / 1000,
      }}
    >
      {children}
    </motion.div>
  );
}
