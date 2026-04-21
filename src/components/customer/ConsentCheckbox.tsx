import { forwardRef, type InputHTMLAttributes } from 'react';

export interface ConsentCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

const ConsentCheckbox = forwardRef<HTMLInputElement, ConsentCheckboxProps>(
  function ConsentCheckbox(
    { label, error, className = '', id, ...rest },
    ref,
  ) {
    const inputId = id ?? 'consent-checkbox';
    const errorId = `${inputId}-error`;
    return (
      <div className={className}>
        <label
          htmlFor={inputId}
          className="flex cursor-pointer items-start gap-3"
        >
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-yellow"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            {...rest}
          />
          <span className="font-sans text-[13px] leading-[1.6] text-obsidian/80">
            {label}
          </span>
        </label>
        {error ? (
          <span
            id={errorId}
            className="mt-2 block font-sans text-[13px] text-danger"
          >
            {error}
          </span>
        ) : null}
      </div>
    );
  },
);

export default ConsentCheckbox;
