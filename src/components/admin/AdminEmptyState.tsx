export interface AdminEmptyStateProps {
  title: string;
  subtitle?: string;
}

export default function AdminEmptyState({
  title,
  subtitle,
}: AdminEmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <p className="text-lg font-semibold text-obsidian">{title}</p>
      {subtitle ? (
        <p className="text-sm text-obsidian/60">{subtitle}</p>
      ) : null}
    </div>
  );
}
