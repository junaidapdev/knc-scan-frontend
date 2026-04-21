import { forwardRef, type InputHTMLAttributes } from 'react';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/** Generic text input used for name and future string fields. */
const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { label, error, className = '', id, ...rest },
    ref,
  ) {
    const inputId = id ?? 'text-input';
    const errorId = `${inputId}-error`;
    return (
      <label htmlFor={inputId} className={`block ${className}`}>
        <span className="eyebrow text-obsidian/70">{label}</span>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={[
            'mt-2 block w-full h-12 rounded-md bg-white px-3 font-sans text-[14px] text-obsidian',
            'border-[1.5px] focus:outline-none focus:shadow-focus-yellow',
            'placeholder:text-obsidian/30',
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

export default TextInput;
