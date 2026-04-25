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
 * v2 OTP input — visually rendered as N separate digit boxes.
 * Internally still a single <input> (positioned transparently over the row)
 * so paste, autocomplete (one-time-code), and keyboard input all just work.
 * The next-to-type box gets a yellow background + blinking cursor.
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

    const cells = Array.from({ length }, (_, i) => i);
    const activeIndex = Math.min(value.length, length - 1);

    return (
      <div className={`block ${className}`}>
        {/* Visually-hidden label — kept for screen readers + tests. */}
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>

        <div className="relative" style={{ direction: 'ltr' }}>
          {/* Visual boxes */}
          <div className="flex justify-center gap-3" aria-hidden="true">
            {cells.map((i) => {
              const digit = value[i] ?? '';
              const isActive = i === activeIndex && value.length < length;
              return (
                <div
                  key={i}
                  className="relative flex items-center justify-center font-display font-extrabold text-obsidian"
                  style={{
                    flex: 1,
                    maxWidth: 68,
                    height: 76,
                    borderRadius: 12,
                    background: isActive ? '#FFD700' : '#FFFFFF',
                    border: error
                      ? '2px solid #C73B3B'
                      : '2px solid #0D0D0D',
                    fontSize: 32,
                  }}
                >
                  {digit}
                  {isActive && !digit ? (
                    <span
                      aria-hidden="true"
                      className="absolute animate-pulse"
                      style={{
                        width: 2.5,
                        height: 30,
                        background: '#0D0D0D',
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Transparent input layered over the row — receives all input. */}
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
            className="absolute inset-0 h-full w-full bg-transparent text-transparent caret-transparent focus:outline-none"
            style={{ fontSize: 32 }}
            {...rest}
          />
        </div>

        {error ? (
          <p
            id={errorId}
            className="mt-3 text-center font-sans font-medium text-danger"
            style={{ fontSize: 13 }}
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

export default OtpInput;
