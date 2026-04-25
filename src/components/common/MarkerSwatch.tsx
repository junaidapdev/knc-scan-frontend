import type { ReactNode } from 'react';

/**
 * MarkerSwatch — yellow highlighter underline behind a headline keyword.
 * Renders children inside a relative <span> with a yellow pseudo-rectangle
 * rotated -1 deg underneath, imitating a hand-drawn marker stroke.
 *
 * Usage:
 *   <h1>
 *     Collect stamps,{' '}
 *     <MarkerSwatch>earn rewards</MarkerSwatch>
 *   </h1>
 */

export interface MarkerSwatchProps {
  children: ReactNode;
  className?: string;
}

export default function MarkerSwatch({
  children,
  className = '',
}: MarkerSwatchProps): JSX.Element {
  return (
    <span
      className={['relative inline whitespace-nowrap', className].join(' ')}
    >
      {/* Yellow marker background — sits behind text */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[0.05em] -z-10 block h-[0.55em] origin-center -rotate-1 rounded-sm bg-yellow opacity-90"
      />
      {children}
    </span>
  );
}
