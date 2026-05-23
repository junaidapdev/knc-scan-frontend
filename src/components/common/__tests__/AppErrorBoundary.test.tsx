import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { env } from '@/config/env';
import AppErrorBoundary from '../AppErrorBoundary';

const RAW_ERROR_MESSAGE = "select * from customers where id = 'customer-1' failed";

function renderBoundaryWithError(error: Error): void {
  const boundaryRef = createRef<AppErrorBoundary>();

  render(
    <AppErrorBoundary ref={boundaryRef}>
      <div>Safe child</div>
    </AppErrorBoundary>,
  );

  act(() => {
    boundaryRef.current?.setState({ error });
  });
}

describe('AppErrorBoundary', () => {
  const originalMode = env.MODE;

  afterEach(() => {
    env.MODE = originalMode;
  });

  it('shows raw error messages outside production', () => {
    env.MODE = 'development';

    renderBoundaryWithError(new Error(RAW_ERROR_MESSAGE));

    expect(screen.getByText(RAW_ERROR_MESSAGE)).toBeInTheDocument();
  });

  it('hides raw error messages in production', () => {
    env.MODE = 'production';

    renderBoundaryWithError(new Error(RAW_ERROR_MESSAGE));

    expect(screen.queryByText(RAW_ERROR_MESSAGE)).not.toBeInTheDocument();
    expect(
      screen.getByText(/We could not load this screen safely/i),
    ).toBeInTheDocument();
  });
});
