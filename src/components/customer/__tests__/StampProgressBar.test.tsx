import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import StampProgressBar from '../StampProgressBar';

describe('StampProgressBar', () => {
  it('renders 10 cells by default with the given current count', () => {
    render(<StampProgressBar current={3} />);
    const grid = screen.getByRole('img');
    expect(grid).toHaveAttribute('aria-label', '3 of 10 stamps');
    // filled cells render a checkmark, empty ones render their index+1.
    expect(screen.getAllByText('✓').length).toBe(3);
  });

  it('honors a custom max and highlights the fresh stamp', () => {
    render(<StampProgressBar current={5} max={5} highlightIndex={4} />);
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      '5 of 5 stamps',
    );
    expect(screen.getAllByText('✓').length).toBe(5);
  });
});
