import { Component, type ErrorInfo, type ReactNode } from 'react';

import { captureException } from '@/lib/sentry';

export interface AppErrorBoundaryProps {
  children: ReactNode;
  /** Force admin-style (English) fallback copy. Defaults to auto-detect. */
  scope?: 'customer' | 'admin';
}

interface AppErrorBoundaryState {
  error: Error | null;
}

/**
 * React error boundary — renders a bilingual fallback on customer routes and
 * an English fallback on admin routes. Sends the error to Sentry via
 * captureException (no-op when Sentry is disabled).
 */
export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    captureException(error, { componentStack: info.componentStack });
  }

  private isAdminScope(): boolean {
    if (this.props.scope) return this.props.scope === 'admin';
    if (typeof window === 'undefined') return false;
    return window.location.pathname.startsWith('/admin');
  }

  private reload = (): void => {
    window.location.reload();
  };

  private reportIssue = (): void => {
    const subject = encodeURIComponent('Kayan error');
    const body = encodeURIComponent(this.state.error?.message ?? 'Unknown');
    window.location.href = `mailto:support@kayansweets.com?subject=${subject}&body=${body}`;
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    const admin = this.isAdminScope();
    const title = admin
      ? 'Something went wrong — please refresh'
      : "Something went wrong — please refresh / حدث خطأ — يرجى تحديث الصفحة";
    const refreshLabel = admin ? 'Refresh' : 'Refresh / تحديث';
    const reportLabel = admin ? 'Report issue' : 'Report issue / إبلاغ';

    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-bg px-6">
        <div className="w-full max-w-md rounded-lg border-hairline border-obsidian/10 bg-white p-6 shadow-sm">
          <h1 className="font-display text-[24px] tracking-[2px] text-obsidian">
            {title}
          </h1>
          {this.state.error.message ? (
            <p className="mt-3 font-mono text-[12px] text-obsidian/60">
              {this.state.error.message}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={this.reload}
              className="w-full rounded-md bg-yellow px-4 py-3 font-sans text-[14px] font-semibold text-obsidian hover:bg-yellow-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
            >
              {refreshLabel}
            </button>
            <button
              type="button"
              onClick={this.reportIssue}
              className="w-full rounded-md border-hairline border-obsidian/20 bg-white px-4 py-3 font-sans text-[14px] font-semibold text-obsidian hover:bg-obsidian/5"
            >
              {reportLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
