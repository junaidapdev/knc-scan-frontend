export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

/**
 * Reusable skeleton primitive — neutral animated rectangle. Use for customer
 * page data-fetch placeholders. Rounded default is `md`; pass `full` for
 * circles (e.g. avatars).
 */
export default function Skeleton({
  width,
  height,
  rounded = 'md',
  className = '',
}: SkeletonProps): JSX.Element {
  const roundedClass =
    rounded === 'full' ? 'rounded-full' : `rounded-${rounded}`;
  const style: Record<string, string> = {};
  if (width !== undefined)
    style.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined)
    style.height = typeof height === 'number' ? `${height}px` : height;
  return (
    <div
      className={`animate-pulse bg-obsidian/10 ${roundedClass} ${className}`}
      style={style}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    />
  );
}
