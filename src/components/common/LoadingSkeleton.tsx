export interface LoadingSkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/** Neutral skeleton block — obsidian-tinted on the canvas bg. */
export default function LoadingSkeleton({
  className = '',
  rounded = 'md',
}: LoadingSkeletonProps): JSX.Element {
  const roundedClass =
    rounded === 'full' ? 'rounded-full' : `rounded-${rounded}`;
  return (
    <div
      className={`animate-pulse bg-obsidian/10 ${roundedClass} ${className}`}
      role="status"
      aria-live="polite"
    />
  );
}
