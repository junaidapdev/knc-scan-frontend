import { forwardRef, useId, type InputHTMLAttributes } from 'react';

export interface ConsentCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

/**
 * v2 consent checkbox.
 * Native input is sr-only; a single sibling <span> tile renders the visual.
 * Tailwind's `peer-checked:*` modifiers re-style the tile when checked:
 *   • unchecked → transparent fill, obsidian border, ✓ hidden via text-transparent
 *   • checked   → obsidian fill, yellow ✓ visible
 */
const ConsentCheckbox = forwardRef<HTMLInputElement, ConsentCheckboxProps>(
  function ConsentCheckbox(
    { label, error, className = '', id, ...rest },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? `consent-${reactId}`;
    const errorId = `${inputId}-error`;
    return (
      <div className={className}>
        <label
          htmlFor={inputId}
          className="flex cursor-pointer items-start gap-3"
        >
          {/* Visually-hidden native checkbox — drives state via :checked. */}
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer sr-only"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            {...rest}
          />
          {/* Visual tile — direct sibling of the peer input, so peer-checked
              modifiers fire correctly. */}
          <span
            aria-hidden="true"
            className={[
              'inline-flex shrink-0 items-center justify-center',
              'font-display font-black leading-none',
              'text-transparent transition-colors',
              'peer-checked:bg-obsidian peer-checked:text-yellow',
              'peer-focus-visible:shadow-focus-yellow',
            ].join(' ')}
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              border: '1.5px solid #0D0D0D',
              fontSize: 13,
              marginTop: 2,
            }}
          >
            ✓
          </span>
          <span
            className="font-sans font-medium text-obsidian"
            style={{ fontSize: 13, lineHeight: 1.5 }}
          >
            {label}
          </span>
        </label>
        {error ? (
          <p
            id={errorId}
            className="mt-2 font-sans font-medium text-danger"
            style={{ fontSize: 13 }}
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

export default ConsentCheckbox;
