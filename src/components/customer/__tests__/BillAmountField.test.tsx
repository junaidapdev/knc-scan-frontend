import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BillAmountField from '../BillAmountField';

/**
 * Drives the component the way react-hook-form's <Controller> does: the parsed
 * number is the external source of truth, fed straight back in as `value`.
 * This is the exact loop that previously erased the decimal point.
 */
function Harness({
  onValue,
}: {
  onValue: (value: number | undefined) => void;
}): JSX.Element {
  const [value, setValue] = useState<number | undefined>(undefined);
  return (
    <BillAmountField
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue(next);
      }}
      currencyLabel="SAR"
      inputLabel="Bill amount"
    />
  );
}

function getInput(): HTMLInputElement {
  return document.getElementById('amount-input') as HTMLInputElement;
}

describe('BillAmountField', () => {
  it('lets the user type a decimal amount (regression: the dot used to be erased)', async () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    const input = getInput();

    await userEvent.type(input, '12.50');

    // The typed text (dot + trailing zero) survives on screen...
    expect(input.value).toBe('12.50');
    // ...and the form receives the numeric value.
    expect(onValue).toHaveBeenLastCalledWith(12.5);
  });

  it('keeps a lone trailing dot while the user is mid-entry', async () => {
    render(<Harness onValue={vi.fn()} />);
    const input = getInput();

    await userEvent.type(input, '8.');

    expect(input.value).toBe('8.');
  });

  it('strips letters and clamps to two decimal places (e.g. on paste)', () => {
    render(<Harness onValue={vi.fn()} />);
    const input = getInput();

    fireEvent.change(input, { target: { value: '1a2.999' } });

    expect(input.value).toBe('12.99');
  });

  it('masks the amount from Microsoft Clarity recordings', () => {
    render(<Harness onValue={vi.fn()} />);
    expect(getInput()).toHaveAttribute('data-clarity-mask', 'true');
  });
});
