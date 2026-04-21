import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PhoneInput from '../PhoneInput';
import { withI18n } from '@/test/i18nTestHarness';

describe('PhoneInput', () => {
  it('shows the label and locked prefix', () => {
    render(withI18n(<PhoneInput label="Mobile" />));
    expect(screen.getByText('Mobile')).toBeInTheDocument();
    expect(screen.getByText('+966')).toBeInTheDocument();
  });

  it('limits input to 9 characters (maxLength attribute)', async () => {
    render(withI18n(<PhoneInput label="Mobile" />));
    const input = document.getElementById('phone-input') as HTMLInputElement;
    expect(input.maxLength).toBe(9);
    await userEvent.type(input, '512345678');
    expect(input.value).toBe('512345678');
  });

  it('surfaces an error via aria-invalid', () => {
    render(withI18n(<PhoneInput label="Mobile" error="Must start with 5" />));
    const input = document.getElementById('phone-input') as HTMLInputElement;
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Must start with 5')).toBeInTheDocument();
  });
});
