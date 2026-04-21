import {
  forwardRef,
  useCallback,
  type ChangeEvent,
  type ClipboardEvent,
  type InputHTMLAttributes,
} from 'react';

import { OTP_LENGTH } from '@/constants/ui';

export interface OtpInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'maxLength' | 'onChange' | 'value'
  > {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (value: string) => void;
  label: string;
  error?: string;
  length?: number;
}

/**
 * Single monospace input for the 4-digit OTP. Digits-only, auto-strips
 * non-numeric characters on paste, fires onComplete when full.
 */
const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(
  function OtpInput(
    {
      value,
      onChange,
      onComplete,
      label,
      error,
      length = OTP_LENGTH,
      className = '',
      id,
      ...rest
    },
    ref,
  ) {
    const inputId = id ?? 'otp-input';
    const errorId = `${inputId}-error`;

    const sanitize = useCallback(
      (raw: string): string => raw.replace(/\D/g, '').slice(0, length),
      [length],
    );

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
      const next = sanitize(e.target.value);
      onChange(next);
      if (next.length === length && onComplete) onComplete(next);
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>): void => {
      const pasted = e.clipboardData.getData('text');
      const clean = sanitize(pasted);
      if (clean.length > 0) {
        e.preventDefault();
        onChange(clean);
        if (clean.length === length && onComplete) onComplete(clean);
      }
    };

    return (
      <label htmlFor={inputId} className={`block ${className}`}>
        <span className="eyebrow text-obsidian/70">{label}</span>
        <input
          ref={ref}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d*"
          maxLength={length}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={[
            'mt-2 block w-full h-16 rounded-md border-[1.5px] bg-white text-center',
            'font-mono text-[28px] tracking-[0.8em] text-obsidian',
            'focus:outline-none focus:shadow-focus-yellow',
            error
              ? 'border-danger'
              : 'border-obsidian/20 focus:border-obsidian',
          ].join(' ')}
          {...rest}
        />
        {error ? (
          <span
            id={errorId}
            className="mt-2 block font-sans text-[13px] text-danger"
          >
            {error}
          </span>
        ) : null}
      </label>
    );
  },
);

export default OtpInput;
