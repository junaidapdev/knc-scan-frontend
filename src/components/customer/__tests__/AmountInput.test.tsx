import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AmountInput from '../AmountInput';
import { withI18n } from '@/test/i18nTestHarness';

describe('AmountInput', () => {
  it('renders the label and currency suffix', () => {
    render(
      withI18n(<AmountInput label="Bill amount" currencyLabel="SAR" />),
    );
    expect(screen.getByText('Bill amount')).toBeInTheDocument();
    expect(screen.getByText('SAR')).toBeInTheDocument();
  });

  it('emits change events with decimal input', async () => {
    const onChange = vi.fn();
    render(
      withI18n(
        <AmountInput
          label="Bill amount"
          currencyLabel="SAR"
          onChange={onChange}
        />,
      ),
    );
    const input = document.getElementById('amount-input') as HTMLInputElement;
    await userEvent.type(input, '125');
    expect(input.value).toBe('125');
    expect(onChange).toHaveBeenCalled();
  });

  it('flags an error via aria-invalid', () => {
    render(
      withI18n(
        <AmountInput
          label="Bill amount"
          currencyLabel="SAR"
          error="Out of range"
        />,
      ),
    );
    const input = document.getElementById('amount-input') as HTMLInputElement;
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Out of range')).toBeInTheDocument();
  });
});
