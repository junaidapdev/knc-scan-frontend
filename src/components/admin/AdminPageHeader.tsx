import type { ReactNode } from 'react';

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function AdminPageHeader({
  title,
  subtitle,
  actions,
}: AdminPageHeaderProps): JSX.Element {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-obsidian">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-obsidian/60">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </header>
  );
}
