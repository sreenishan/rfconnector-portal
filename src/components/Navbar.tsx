import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const sectionLinks = [
  { label: 'Features',     href: '#features'     },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing',      href: '#pricing'      },
];

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';
const iconButton = `inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors ${focusRing}`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { darkMode, toggleTheme } = useTheme();
  const isDashboard = pathname === '/dashboard';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function scrollToPortal(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === '/') {
      e.preventDefault();
      document.getElementById('choose-portal')?.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-gray-200/60 bg-white/80 dark:border-slate-800/60 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className={`flex items-center gap-2.5 group rounded-lg ${focusRing}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-lg group-hover:bg-brand-500 transition-colors">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white tracking-tight">
              RFConnector
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {!isDashboard && sectionLinks.map(({ label, href }) => (
              <a key={href} href={href} className={`text-sm text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded ${focusRing}`}>
                {label}
              </a>
            ))}
            {isDashboard ? (
              <span className="text-sm text-gray-500 dark:text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-charge-500 mr-2 animate-pulse-slow" />
                Live
              </span>
            ) : (
              <div className="flex items-center gap-4">
                <a
                  href="/#choose-portal"
                  onClick={scrollToPortal}
                  className={`text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition-colors rounded ${focusRing}`}
                >
                  Sign in
                </a>
                <Link
                  to="/register"
                  className={`rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20 ${focusRing}`}
                >
                  Get API Keys →
                </Link>
              </div>
            )}
          </div>

          {/* Theme + Mobile toggle */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className={iconButton}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              className={`md:hidden ${iconButton}`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — translucent bg classes avoid index.css's dark-mode `bg-white` override */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95 px-4 py-3">
          {sectionLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white ${focusRing}`}
            >
              {label}
            </a>
          ))}
          <a
            href="/#choose-portal"
            onClick={scrollToPortal}
            className={`block rounded-lg px-3 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800 ${focusRing}`}
          >
            Sign in
          </a>
          <Link
            to="/register"
            onClick={() => setOpen(false)}
            className={`mt-2 block rounded-lg bg-brand-600 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-brand-500 ${focusRing}`}
          >
            Get API Keys →
          </Link>
        </div>
      )}
    </nav>
  );
}
