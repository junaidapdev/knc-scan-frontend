/**
 * Small centered spinner shown while a lazy-loaded admin page chunk is
 * fetched. Admin-only; customer pages are still eagerly imported.
 */
export default function AdminPageSpinner(): JSX.Element {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-obsidian/10 border-t-yellow" />
    </div>
  );
}
