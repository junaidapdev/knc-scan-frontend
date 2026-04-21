import { useTranslation } from 'react-i18next';

export interface BirthdayPickerProps {
  label: string;
  month: number | null;
  day: number | null;
  onChangeMonth: (m: number | null) => void;
  onChangeDay: (d: number | null) => void;
  error?: string;
  className?: string;
}

const DAYS: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS: number[] = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * Month + day selects (no year). Uses i18next `customer:months.<n>` for
 * localized month names. Day values are rendered via Space Mono (numeric).
 */
export default function BirthdayPicker({
  label,
  month,
  day,
  onChangeMonth,
  onChangeDay,
  error,
  className = '',
}: BirthdayPickerProps): JSX.Element {
  const { t } = useTranslation('customer');
  const errorId = 'birthday-error';

  const monthClasses = [
    'h-12 rounded-md bg-white px-3 font-sans text-[14px] text-obsidian',
    'border-[1.5px] focus:outline-none focus:shadow-focus-yellow',
    error ? 'border-danger' : 'border-obsidian/20 focus:border-obsidian',
  ].join(' ');

  return (
    <div className={className}>
      <span className="eyebrow text-obsidian/70">{label}</span>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <select
          aria-label={t('registerDetails.birthdayMonth')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          value={month ?? ''}
          onChange={(e) =>
            onChangeMonth(e.target.value ? Number(e.target.value) : null)
          }
          className={monthClasses}
        >
          <option value="" disabled>
            {t('registerDetails.birthdayMonth')}
          </option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {t(`months.${m}`)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('registerDetails.birthdayDay')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          value={day ?? ''}
          onChange={(e) =>
            onChangeDay(e.target.value ? Number(e.target.value) : null)
          }
          className={`${monthClasses} font-mono`}
        >
          <option value="" disabled>
            {t('registerDetails.birthdayDay')}
          </option>
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
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
}
