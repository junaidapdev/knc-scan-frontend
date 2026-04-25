import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export interface BrandedButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-yellow text-obsidian border-yellow hover:bg-yellow-hover disabled:bg-canvas-bg disabled:text-obsidian/40 disabled:border-canvas-bg disabled:shadow-none',
  secondary:
    'bg-transparent text-obsidian border-[1.5px] border-obsidian hover:bg-obsidian hover:text-yellow disabled:opacity-50',
  ghost:
    'bg-yellow-tint text-[#9C8200] border-transparent hover:bg-yellow disabled:opacity-50',
  danger:
    'bg-danger/10 text-danger border-danger hover:bg-danger hover:text-white disabled:opacity-50',
};

/** Box-shadow applied only to the primary variant (echoes the yellow glow). */
const VARIANT_SHADOW: Record<ButtonVariant, string | undefined> = {
  primary: '0 6px 16px rgba(255, 215, 0, 0.4)',
  secondary: undefined,
  ghost: undefined,
  danger: undefined,
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-[14px]',
  lg: 'h-14 px-7 text-[16px]',
};

const BrandedButton = forwardRef<HTMLButtonElement, BrandedButtonProps>(
  function BrandedButton(
    {
      variant = 'primary',
      size = 'lg',
      loading = false,
      fullWidth = false,
      leadingIcon,
      className = '',
      disabled,
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) {
    const reduceMotion = useReducedMotion();

    const classes = [
      'inline-flex items-center justify-center gap-2 rounded-full',
      'font-sans font-bold tracking-wide',
      'border-[1.5px] transition-colors duration-150 select-none',
      'focus:outline-none focus-visible:shadow-focus-yellow',
      fullWidth ? 'w-full' : '',
      VARIANT_CLASSES[variant],
      SIZE_CLASSES[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const boxShadow = VARIANT_SHADOW[variant];
    const whileTap = reduceMotion ? undefined : { scale: 0.97 };
    // Cast rest to a motion-compatible props bag — framer-motion narrows some
    // DOM event types (e.g. onAnimationStart) which are incompatible with the
    // native button handlers, but we never pass those in practice.
    const motionRest = rest as HTMLMotionProps<'button'>;

    return (
      <motion.button
        ref={ref}
        type={type}
        className={classes}
        style={boxShadow ? { boxShadow } : undefined}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        whileTap={whileTap}
        {...motionRest}
      >
        {loading ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          leadingIcon
        )}
        <span>{children}</span>
      </motion.button>
    );
  },
);

export default BrandedButton;
