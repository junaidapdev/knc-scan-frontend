import { forwardRef, type InputHTMLAttributes } from 'react';

export interface AmountInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: string;
  currencyLabel: string;
  error?: string;
}

/**
 * Numeric bill-amount input. Uses `inputMode="decimal"` so mobile keyboards
 * surface the number pad. Visually locked currency suffix.
 */
const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  function AmountInput(
    { label, currencyLabel, error, id, className = '', ...rest },
    ref,
  ) {
    const inputId = id ?? 'amount-input';
    const errorId = `${inputId}-error`;
    return (
      <label htmlFor={inputId} className={`block ${className}`}>
        <span className="eyebrow text-obsidian/70">{label}</span>
        <div
          className={[
            'mt-2 flex h-14 items-center rounded-md bg-white border-[1.5px] overflow-hidden',
            'focus-within:shadow-focus-yellow',
            error
              ? 'border-danger'
              : 'border-obsidian/20 focus-within:border-obsidian',
          ].join(' ')}
        >
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="flex-1 h-full bg-transparent px-4 font-mono text-[20px] text-obsidian placeholder:text-obsidian/30 focus:outline-none"
            {...rest}
          />
          <span className="select-none pe-4 ps-2 font-mono text-[14px] text-obsidian/60">
            {currencyLabel}
          </span>
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

export default AmountInput;
