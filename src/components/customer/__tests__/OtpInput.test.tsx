import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import OtpInput from '../OtpInput';
import { withI18n } from '@/test/i18nTestHarness';

function OtpHarness(props: {
  onComplete?: (v: string) => void;
  initial?: string;
}): JSX.Element {
  const [value, setValue] = useState<string>(props.initial ?? '');
  return (
    <OtpInput
      label="OTP"
      value={value}
      onChange={setValue}
      onComplete={props.onComplete}
    />
  );
}

describe('OtpInput', () => {
  it('renders the label', () => {
    render(withI18n(<OtpHarness />));
    expect(screen.getByText('OTP')).toBeInTheDocument();
  });

  it('accepts digit typing and fires onComplete at length 4', async () => {
    const onComplete = vi.fn();
    render(withI18n(<OtpHarness onComplete={onComplete} />));
    const input = screen.getByLabelText('OTP');
    await userEvent.type(input, '1234');
    expect((input as HTMLInputElement).value).toBe('1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('strips non-digit characters on paste', async () => {
    const onComplete = vi.fn();
    render(withI18n(<OtpHarness onComplete={onComplete} />));
    const input = screen.getByLabelText('OTP') as HTMLInputElement;
    input.focus();
    await userEvent.paste('ab12cd34');
    expect(input.value).toBe('1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('enforces the max length', async () => {
    render(withI18n(<OtpHarness />));
    const input = screen.getByLabelText('OTP') as HTMLInputElement;
    await userEvent.type(input, '123456');
    expect(input.value.length).toBe(4);
  });
});
