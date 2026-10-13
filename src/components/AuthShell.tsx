import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

// Theme-aware tokens for auth/registration pages. Avoids bg-white, bg-slate-50..200 and
// text-slate-400..900 because index.css force-overrides those in dark mode.
const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';

export const auth = {
  focusRing,
  heading:   'text-2xl font-bold tracking-tight text-gray-900 dark:text-white',
  sub:       'text-sm text-gray-600 dark:text-slate-400',
  muted:     'text-gray-500 dark:text-slate-500',
  body:      'text-gray-700 dark:text-slate-300',
  card:      'rounded-2xl border border-gray-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none',
  label:     'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5',
  input:     'w-full rounded-xl border border-gray-300 bg-white/90 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition',
  inputIcon: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none',
  primary:   `w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500 transition-all disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500 ${focusRing}`,
  secondary: `w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white transition-colors ${focusRing}`,
  link:      `font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-white transition-colors rounded ${focusRing}`,
  quietLink: `text-gray-500 hover:text-gray-800 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded ${focusRing}`,
  errorBox:  'flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5',
  errorText: 'text-sm text-red-700 dark:text-red-300',
  devBox:    'rounded-xl border border-dashed border-gray-300 bg-gray-100/70 dark:border-slate-700 dark:bg-slate-900/60',
  devItem:   `w-full text-left rounded-lg px-3 py-2 bg-white/90 hover:bg-gray-50 border border-gray-200 dark:border-transparent dark:bg-slate-800/80 dark:hover:bg-slate-700 transition-colors ${focusRing}`,
};

interface AuthShellProps {
  badge?: string;
  headerRight?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}

export default function AuthShell({ badge, headerRight, aside, children }: AuthShellProps) {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(99,102,241,0.14) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <header className="relative z-10 h-16 shrink-0 border-b border-gray-200 bg-white/70 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/70">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className={`flex items-center gap-2.5 rounded-lg ${focusRing}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-lg">
              <Zap size={16} className="text-white" />
            </span>
            <span className="font-bold tracking-tight text-gray-900 dark:text-white">RFConnector</span>
          </Link>
          {badge && (
            <span className="hidden sm:inline-block rounded-md border border-gray-300 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:border-slate-700 dark:text-slate-400">
              {badge}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {headerRight}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors ${focusRing}`}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <div className="relative flex flex-1">
        {aside && (
          <aside className="hidden lg:flex w-96 shrink-0 flex-col justify-center border-r border-gray-200 bg-white/50 px-12 py-12 dark:border-slate-800/60 dark:bg-slate-900/30">
            {aside}
          </aside>
        )}
        <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
