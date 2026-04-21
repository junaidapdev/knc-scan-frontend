import { forwardRef, type InputHTMLAttributes } from 'react';

import {
  SAUDI_PHONE_PREFIX,
  SAUDI_PHONE_TAIL_LENGTH,
} from '@/constants/ui';

export interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'maxLength'> {
  label: string;
  error?: string;
  prefixLabel?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    { label, error, prefixLabel, className = '', id, ...rest },
    ref,
  ) {
    const inputId = id ?? 'phone-input';
    const errorId = `${inputId}-error`;
    return (
      <label htmlFor={inputId} className={`block ${className}`}>
        <span className="eyebrow text-obsidian/70">{label}</span>
        <div
          className={[
            'mt-2 flex h-14 items-stretch overflow-hidden rounded-md border-[1.5px]',
            error
              ? 'border-danger'
              : 'border-obsidian/20 focus-within:border-obsidian focus-within:shadow-focus-yellow',
            'bg-white',
          ].join(' ')}
        >
          <span
            className="flex items-center border-e-[1.5px] border-obsidian/10 bg-canvas-bg px-4 font-mono text-[14px] text-obsidian"
            aria-hidden="true"
          >
            {prefixLabel ?? SAUDI_PHONE_PREFIX}
          </span>
          <input
            ref={ref}
            id={inputId}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={SAUDI_PHONE_TAIL_LENGTH}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="flex-1 bg-transparent px-4 font-mono text-[14px] text-obsidian placeholder:text-obsidian/30 focus:outline-none"
            {...rest}
          />
        </div>
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

export default PhoneInput;
