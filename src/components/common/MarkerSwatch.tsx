import type { ReactNode } from 'react';

/**
 * MarkerSwatch — solid yellow block highlight behind a headline keyword.
 * Matches the v2 design: yellow inline-block with horizontal padding and a
 * subtle -1deg rotation, sitting flush around the text.
 *
 * Usage:
 *   <h1>
 *     Your number,{' '}
 *     <MarkerSwatch>please.</MarkerSwatch>
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
      className={['whitespace-nowrap', className].join(' ')}
      style={{
        display: 'inline-block',
        background: '#FFD700',
        color: '#0D0D0D',
        padding: '0 8px',
        transform: 'rotate(-1deg)',
      }}
    >
      {children}
    </span>
  );
}
