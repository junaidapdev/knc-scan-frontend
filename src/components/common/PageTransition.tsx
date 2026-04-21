import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Subtle fade + slide-up on mount for customer screens. Respects
 * prefers-reduced-motion — skips the slide when reduced motion is requested.
 */
export default function PageTransition({
  children,
  className,
}: PageTransitionProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
