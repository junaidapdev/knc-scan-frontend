import { useEffect, useState, type ChangeEvent } from 'react';

export interface BillAmountFieldProps {
  /** Numeric form value (react-hook-form field value). `undefined` = empty. */
  value: number | undefined;
  /** Emits the parsed number, or `undefined` while the field is empty/partial. */
  onChange: (value: number | undefined) => void;
  onBlur?: () => void;
  currencyLabel: string;
  inputLabel: string;
  error?: boolean;
  id?: string;
}

/**
 * Big centered bill-amount input used on the scan + registration steps.
 *
 * Why its own component (vs. AmountInput): both amount screens had a verbatim
 * copy of this markup AND a controlled-input bug that made the decimal point
 * impossible to type. The visible value was derived from the PARSED number, so
 * "12." round-tripped through Number()/String() back to "12", erasing the dot
 * on every keystroke. Here the raw text the user typed is the source of truth
 * for what's displayed, and the parsed number is pushed to the form
 * separately — so "12.", "12.5", "12.50" and ".5" all survive mid-edit.
 *
 * Input is sanitised to digits + a single decimal separator + at most two
 * fractional digits, matching the backend's `bill_amount numeric(10, 2)`.
 *
 * `data-clarity-mask="true"` keeps the amount out of Microsoft Clarity session
 * recordings (Chunk 16 intent — the previous inline inputs omitted it).
 */

function parseAmount(text: string): number | undefined {
  if (text === '' || text === '.') return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

// Keep digits, one decimal separator (comma normalised to dot), and up to two
// fractional digits. Returns a partial-but-valid string so an in-progress
// "12." is preserved rather than snapped back to "12".
function sanitizeAmount(input: string): string {
  const cleaned = input.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot === -1) return cleaned;
  const intPart = cleaned.slice(0, dot);
  const decPart = cleaned
    .slice(dot + 1)
    .replace(/\./g, '')
    .slice(0, 2);
  return `${intPart}.${decPart}`;
}

export default function BillAmountField({
  value,
  onChange,
  onBlur,
  currencyLabel,
  inputLabel,
  error = false,
  id = 'amount-input',
}: BillAmountFieldProps): JSX.Element {
  const [text, setText] = useState<string>(
    value === undefined ? '' : String(value),
  );

  // Re-sync the visible text only when the numeric value changes from OUTSIDE
  // the component (e.g. a react-hook-form reset). The equality guard prevents
  // clobbering an in-progress entry like "12." whose parsed value (12) already
  // matches the form value.
  useEffect(() => {
    if (value !== parseAmount(text)) {
      setText(value === undefined ? '' : String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const next = sanitizeAmount(event.target.value);
    setText(next);
    onChange(parseAmount(next));
  };

  return (
    <div
      className="relative flex items-baseline justify-center gap-2 overflow-hidden rounded-2xl"
      style={{
        padding: '28px 24px',
        background: '#FFFFFF',
        border: error ? '2px solid #C73B3B' : '2px solid #0D0D0D',
        direction: 'ltr',
      }}
    >
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        data-clarity-mask="true"
        aria-label={inputLabel}
        aria-invalid={error}
        placeholder="0"
        value={text}
        onChange={handleChange}
        onBlur={onBlur}
        className="bg-transparent text-center font-display font-black text-obsidian placeholder:text-obsidian/25 focus:outline-none"
        style={{
          fontSize: 64,
          letterSpacing: '-3px',
          lineHeight: 1,
          width: '60%',
          minWidth: 80,
        }}
      />
      <span
        className="font-sans font-bold text-obsidian/55"
        style={{ fontSize: 18, letterSpacing: 1 }}
      >
        {currencyLabel}
      </span>
    </div>
  );
}
