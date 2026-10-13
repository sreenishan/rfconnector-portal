import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** When this changes (e.g. route or section id), a caught error is cleared. */
  resetKey?: string;
  /** Compact variant for use inside an existing page layout. */
  inline?: boolean;
}

interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error caught by ErrorBoundary:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;

    const card = (
      <div role="alert" className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/90 p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
          <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Something went wrong</h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-slate-400">
          This {this.props.inline ? 'section' : 'page'} hit an unexpected error. Your data hasn't been changed.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            <RefreshCw size={14} /> Reload page
          </button>
          {!this.props.inline && (
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              Go to home
            </a>
          )}
        </div>
        {this.props.inline && (
          <p className="mt-4 text-xs text-gray-500 dark:text-slate-500">You can also pick another section from the menu.</p>
        )}
      </div>
    );

    return this.props.inline
      ? <div className="flex justify-center py-16">{card}</div>
      : <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-950">{card}</div>;
  }
}
