import { forwardRef, type SelectHTMLAttributes } from 'react';

import type { Branch } from '@/interfaces/branch';

export interface BranchSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  placeholder: string;
  branches: Branch[];
  error?: string;
}

const BranchSelect = forwardRef<HTMLSelectElement, BranchSelectProps>(
  function BranchSelect(
    { label, placeholder, branches, error, className = '', id, ...rest },
    ref,
  ) {
    const selectId = id ?? 'branch-select';
    const errorId = `${selectId}-error`;
    return (
      <label htmlFor={selectId} className={`block ${className}`}>
        <span className="eyebrow text-obsidian/70">{label}</span>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={[
            'mt-2 block w-full h-12 rounded-md bg-white px-3 font-sans text-[14px] text-obsidian',
            'border-[1.5px] focus:outline-none focus:shadow-focus-yellow',
            error
              ? 'border-danger'
              : 'border-obsidian/20 focus:border-obsidian',
          ].join(' ')}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} — {b.city}
            </option>
          ))}
        </select>
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

export default BranchSelect;
