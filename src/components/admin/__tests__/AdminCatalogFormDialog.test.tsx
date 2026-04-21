import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// The dialog itself imports from '@/lib/adminApi' transitively? No —
// it only depends on interfaces. No mock needed here.
import AdminCatalogFormDialog from '@/pages/admin/components/AdminCatalogFormDialog';

vi.mock('@/lib/adminApi', () => ({}));

describe('AdminCatalogFormDialog', () => {
  it('shows a validation error when name_en is empty on submit', async () => {
    const onSubmit = vi.fn();
    render(
      <AdminCatalogFormDialog
        open
        onOpenChange={() => {}}
        onSubmit={onSubmit}
      />,
    );
    // Fill every required field except name_en.
    await userEvent.type(screen.getByLabelText('Code prefix'), 'BOX');
    await userEvent.type(screen.getByLabelText('Name (Arabic)'), 'صندوق');
    await userEvent.click(
      screen.getByRole('button', { name: /Create reward/i }),
    );
    expect(await screen.findByText('Required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with parsed values for a valid form', async () => {
    const onSubmit = vi.fn();
    render(
      <AdminCatalogFormDialog
        open
        onOpenChange={() => {}}
        onSubmit={onSubmit}
      />,
    );
    await userEvent.type(screen.getByLabelText('Code prefix'), 'BOX');
    await userEvent.type(screen.getByLabelText('Name (English)'), 'Box');
    await userEvent.type(screen.getByLabelText('Name (Arabic)'), 'صندوق');
    const valueInput = screen.getByLabelText(
      'Estimated value (SAR)',
    ) as HTMLInputElement;
    await userEvent.clear(valueInput);
    await userEvent.type(valueInput, '50');
    const expiryInput = screen.getByLabelText(
      'Default expiry (days)',
    ) as HTMLInputElement;
    await userEvent.clear(expiryInput);
    await userEvent.type(expiryInput, '90');
    await userEvent.click(
      screen.getByRole('button', { name: /Create reward/i }),
    );
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = onSubmit.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.code_prefix).toBe('BOX');
    expect(payload.name_en).toBe('Box');
    expect(payload.name_ar).toBe('صندوق');
    expect(payload.estimated_value_sar).toBe(50);
    expect(payload.default_expiry_days).toBe(90);
  });

  it('disables the submit button while pending', () => {
    render(
      <AdminCatalogFormDialog
        open
        onOpenChange={() => {}}
        onSubmit={vi.fn()}
        pending
      />,
    );
    const btn = screen.getByRole('button', { name: /Saving…/i });
    expect(btn).toBeDisabled();
  });
});
