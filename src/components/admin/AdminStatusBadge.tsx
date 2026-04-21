import type {
  AdminCatalogStatus,
  AdminIssuedRewardStatus,
} from '@/constants/admin';

export type AdminCustomerStatus = 'active' | 'inactive' | 'reward_ready';

type StatusKind = 'catalog' | 'issued' | 'customer';

export interface AdminStatusBadgeProps {
  kind: StatusKind;
  status: AdminCatalogStatus | AdminIssuedRewardStatus | AdminCustomerStatus;
}

const CATALOG_MAP: Record<AdminCatalogStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-800' },
  paused: { label: 'Paused', className: 'bg-amber-100 text-amber-800' },
  archived: { label: 'Archived', className: 'bg-gray-200 text-gray-700' },
};

const ISSUED_MAP: Record<
  AdminIssuedRewardStatus,
  { label: string; className: string }
> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-900' },
  redeemed: { label: 'Redeemed', className: 'bg-green-100 text-green-800' },
  voided: { label: 'Voided', className: 'bg-red-100 text-red-800' },
  expired: { label: 'Expired', className: 'bg-gray-200 text-gray-700' },
};

const CUSTOMER_MAP: Record<
  AdminCustomerStatus,
  { label: string; className: string }
> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inactive', className: 'bg-gray-200 text-gray-700' },
  reward_ready: {
    label: 'Reward Ready',
    className: 'bg-yellow-100 text-yellow-900',
  },
};

export default function AdminStatusBadge({
  kind,
  status,
}: AdminStatusBadgeProps): JSX.Element {
  let config: { label: string; className: string };
  if (kind === 'catalog') {
    config = CATALOG_MAP[status as AdminCatalogStatus];
  } else if (kind === 'issued') {
    config = ISSUED_MAP[status as AdminIssuedRewardStatus];
  } else {
    config = CUSTOMER_MAP[status as AdminCustomerStatus];
  }

  const className = config?.className ?? 'bg-gray-100 text-gray-700';
  const label = config?.label ?? String(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
