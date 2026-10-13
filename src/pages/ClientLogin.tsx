/**
 * ChargeBridge — Client Portal Login
 * Route: /login  (on portal.chargebridge.io)
 *
 * Step 1 — email + password
 * Step 2 — 6-digit TOTP (2FA)
 */
import { useState, FormEvent, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PORTAL_TYPE } from '../lib/hostConfig.ts';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  AlertCircle, CheckCircle, Activity, FileText,
  Receipt, BarChart3, ShieldCheck,
} from 'lucide-react';
import AuthShell, { auth } from '../components/AuthShell.tsx';
import { usePageTitle } from '../hooks/usePageTitle';

// Client portal's accent is green; emerald-700 keeps white text above 4.5:1 contrast.
const clientPrimary = `w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500 ${auth.focusRing}`;
const clientLink = `font-medium text-emerald-700 hover:text-emerald-800 dark:text-charge-400 dark:hover:text-white transition-colors rounded ${auth.focusRing}`;

// ── Session storage contract (shared with App.tsx guard) ─────────────────────

export const CLIENT_SESSION_KEY = 'cb_client_session';

export interface ClientSession {
  token:    string;
  userId:   string;
  tenantId: string;
  role:     string;
  fullName: string | null;
  email:    string;
  company:  string;
  loginAt:  string;
}

// ── Dev-only demo accounts (DEV guard lets Vite strip them from production) ──

const _DEV_ACCOUNTS = import.meta.env.DEV ? [
  { email: 'demo@volta-networks.com', password: 'demo1234', role: 'admin',  fullName: 'Volta Networks' },
  { email: 'ops@powergrid.io',        password: 'demo1234', role: 'viewer', fullName: 'PowerGrid LatAm' },
  { email: 'client@rfconnector.io',  password: 'demo1234', role: 'admin',  fullName: 'RFConnector' },
] : [];

const NOT_CONFIGURED_MSG = 'Sign-in is unavailable: the authentication service is not configured.';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

// ── What clients see in the portal (brief, honest) ────────────────────────────

const PORTAL_FEATURES = [
  { icon: Activity,  label: 'Live sessions',  desc: 'Track active charging sessions in real time' },
  { icon: FileText,  label: 'CDR & billing',  desc: 'Full charge detail records with Eichrecht sign-off' },
  { icon: Receipt,   label: 'Invoicing',       desc: 'Monthly invoices and outstanding balance at a glance' },
  { icon: BarChart3, label: 'Usage analytics', desc: 'Energy, cost and session trends across all sites' },
];

type Step = 'credentials' | 'otp';

// ── Component ─────────────────────────────────────────────────────────────────

export default function ClientLogin() {
  const navigate = useNavigate();
  usePageTitle('Sign in · Client Portal · RFConnector');

  // Step 1
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [remember, setRemember] = useState(false);

  // Step 2
  const [otp,    setOtp]    = useState('');
  const otpRef = useRef<HTMLInputElement>(null);

  // Shared
  const [step,    setStep]    = useState<Step>('credentials');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  // Partial session held between steps
  const pendingSession = useRef<ClientSession | null>(null);

  useEffect(() => {
    if (step === 'otp') otpRef.current?.focus();
  }, [step]);

  // ── Step 1 — verify credentials ───────────────────────────────────────────

  async function handleCredentials(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (API_BASE) {
        const resp = await fetch(`${API_BASE}/v1/client/auth/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: email.trim(), password }),
        });

        if (resp.status === 429) {
          const after = resp.headers.get('Retry-After') ?? '60';
          setError(`Too many attempts. Try again in ${after} seconds.`);
          setLoading(false);
          return;
        }

        const json = await resp.json() as {
          data?:  { sessionId: string; user: { id: string; tenantId: string; role: string; fullName: string | null } };
          error?: { message: string } | null;
        };

        if (!resp.ok || !json.data) {
          setError('Incorrect email or password.');
          setLoading(false);
          return;
        }

        pendingSession.current = {
          token:    json.data.sessionId,
          userId:   json.data.user.id,
          tenantId: json.data.user.tenantId,
          role:     json.data.user.role,
          fullName: json.data.user.fullName,
          email:    email.trim().toLowerCase(),
          company:  json.data.user.fullName ?? 'Client account',
          loginAt:  new Date().toISOString(),
        };
      } else if (import.meta.env.DEV) {
        await new Promise(r => setTimeout(r, 700));
        const match = _DEV_ACCOUNTS.find(
          a => a.email === email.trim().toLowerCase() && a.password === password,
        );
        if (!match) {
          setError('Incorrect email or password.');
          setLoading(false);
          return;
        }
        pendingSession.current = {
          token: 'dev_token', userId: `dev_${match.email}`,
          tenantId: 'dev_tenant', role: match.role,
          fullName: match.fullName,
          email: match.email,
          company: match.fullName,
          loginAt: new Date().toISOString(),
        };
      } else {
        setError(NOT_CONFIGURED_MSG);
        setLoading(false);
        return;
      }

      setLoading(false);
      setStep('otp');
    } catch {
      setError('Unable to connect. Please try again.');
      setLoading(false);
    }
  }

  // ── Step 2 — verify OTP ───────────────────────────────────────────────────

  async function handleOtp(e: FormEvent) {
    e.preventDefault();
    if (otp.length < 6) { setError('Enter the 6-digit code.'); return; }
    setError('');
    setLoading(true);

    try {
      if (API_BASE) {
        const resp = await fetch(`${API_BASE}/v1/client/auth/verify-otp`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ sessionToken: pendingSession.current?.token, otp }),
        });

        const json = await resp.json() as {
          data?:  { token: string };
          error?: { message: string } | null;
        };

        if (!resp.ok || !json.data) {
          setError('Incorrect code. Try again.');
          setLoading(false);
          return;
        }

        const session: ClientSession = { ...pendingSession.current!, token: json.data.token };
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(CLIENT_SESSION_KEY, JSON.stringify(session));
      } else if (import.meta.env.DEV) {
        // Any 6-digit code is accepted in dev
        await new Promise(r => setTimeout(r, 500));
        if (!/^\d{6}$/.test(otp)) {
          setError('Enter a 6-digit numeric code.');
          setLoading(false);
          return;
        }
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(CLIENT_SESSION_KEY, JSON.stringify(pendingSession.current!));
      } else {
        setError(NOT_CONFIGURED_MSG);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate(PORTAL_TYPE === 'client' ? '/' : '/client'), 500);
    } catch {
      setError('Unable to connect. Please try again.');
      setLoading(false);
    }
  }

  // Auto-submit when 6 digits entered
  function handleOtpChange(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    setError('');
    if (digits.length === 6) {
      setTimeout(() => {
        (document.getElementById('client-otp-form') as HTMLFormElement | null)?.requestSubmit();
      }, 50);
    }
  }

  // ── Layout ────────────────────────────────────────────────────────────────

  const spinner = (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );

  const aside = (
    <>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-charge-400 mb-3">Client Portal</p>
        <h2 className="text-2xl font-bold leading-snug text-gray-900 dark:text-white mb-3">
          Your charging operations,<br />all in one place.
        </h2>
        <p className={`${auth.sub} leading-relaxed`}>
          Monitor usage, review billing records, and track your roaming activity across every site.
        </p>
      </div>
      <ul className="space-y-5">
        {PORTAL_FEATURES.map(({ icon: Icon, label, desc }) => (
          <li key={label} className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-charge-500/10 border border-charge-500/20 flex items-center justify-center shrink-0">
              <Icon size={15} className="text-emerald-700 dark:text-charge-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
              <p className={`text-sm ${auth.sub} mt-0.5`}>{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <AuthShell badge="Client Portal" aside={aside}>
      <div className="w-full max-w-sm">

        {step === 'credentials' ? (
          /* ── Step 1: email + password ─────────────────────────────── */
          <>
            <div className="mb-6">
              <h1 className={`${auth.heading} mb-1`}>Sign in</h1>
              <p className={auth.sub}>Client Portal access</p>
            </div>

            <div className={`${auth.card} p-6 sm:p-7`}>
              <form onSubmit={handleCredentials} className="space-y-4">

                <div>
                  <label htmlFor="client-email" className={auth.label}>Email</label>
                  <div className="relative">
                    <Mail size={14} className={auth.inputIcon} />
                    <input
                      id="client-email"
                      type="email" required autoComplete="email"
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className={`${auth.input} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="client-password" className="text-sm font-medium text-gray-700 dark:text-slate-300">Password</label>
                    <button type="button" className={`text-sm ${auth.quietLink}`}>
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={14} className={auth.inputIcon} />
                    <input
                      id="client-password"
                      type={showPwd ? 'text' : 'password'} required autoComplete="current-password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${auth.input} pl-9 pr-11`}
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${auth.quietLink}`}>
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-emerald-600 dark:border-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  />
                  <span className={`text-sm ${auth.sub}`}>Keep me signed in</span>
                </label>

                {error && (
                  <div role="alert" className={auth.errorBox}>
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <p className={auth.errorText}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading} className={clientPrimary}>
                  {loading ? <>{spinner} Verifying…</> : <>Continue <ArrowRight size={14} /></>}
                </button>
              </form>
            </div>

            <p className={`text-sm ${auth.muted} mt-6 text-center`}>
              Need access?{' '}
              <a href="mailto:hello@rfconnector.io" className={clientLink}>Contact your operator</a>
            </p>

            {import.meta.env.DEV && (
              <div className={`${auth.devBox} mt-6 p-4`}>
                <p className={`text-[11px] font-semibold uppercase tracking-widest ${auth.muted} mb-3`}>
                  Dev — demo accounts
                </p>
                <div className="space-y-1.5">
                  {_DEV_ACCOUNTS.map(a => (
                    <button key={a.email} type="button"
                      onClick={() => { setEmail(a.email); setPassword(a.password); }}
                      className={auth.devItem}>
                      <p className={`text-sm font-medium ${auth.body}`}>
                        {a.fullName}
                        <span className={`ml-2 text-[11px] font-normal uppercase ${auth.muted}`}>{a.role}</span>
                      </p>
                      <p className={`text-xs ${auth.muted} mt-0.5 font-mono`}>{a.email}</p>
                    </button>
                  ))}
                </div>
                <p className={`text-xs ${auth.muted} mt-2 text-center`}>
                  Password for all: <span className="font-mono">demo1234</span>
                </p>
              </div>
            )}
          </>
        ) : (
          /* ── Step 2: OTP ──────────────────────────────────────────── */
          <>
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-charge-500/15 border border-charge-500/25 flex items-center justify-center mb-4">
                <ShieldCheck size={20} className="text-emerald-700 dark:text-charge-400" />
              </div>
              <h1 className={`${auth.heading} mb-1`}>Two-factor authentication</h1>
              <p className={`${auth.sub} leading-relaxed`}>
                Enter the 6-digit code from your<br />authenticator app.
              </p>
              <p className={`text-xs ${auth.muted} mt-2 font-mono`}>{email}</p>
            </div>

            <div className={`${auth.card} p-6 sm:p-7`}>
              <form id="client-otp-form" onSubmit={handleOtp} className="space-y-4">
                <label htmlFor="client-otp" className="sr-only">6-digit code</label>
                <input
                  id="client-otp"
                  ref={otpRef}
                  type="text" inputMode="numeric" autoComplete="one-time-code"
                  value={otp} onChange={e => handleOtpChange(e.target.value)}
                  placeholder="000000" maxLength={6}
                  className={`${auth.input} text-center !py-4 !text-2xl font-mono tracking-[0.5em] ${success ? '!border-charge-500' : ''}`}
                />

                {error && (
                  <div role="alert" className={auth.errorBox}>
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <p className={auth.errorText}>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || success || otp.length < 6}
                  className={success
                    ? 'w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white'
                    : clientPrimary}
                >
                  {success ? (
                    <><CheckCircle size={14} /> Redirecting…</>
                  ) : loading ? (
                    <>{spinner} Verifying…</>
                  ) : (
                    <>Verify &amp; sign in <ArrowRight size={14} /></>
                  )}
                </button>

                <button type="button"
                  onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                  className={`w-full text-sm py-1.5 ${auth.quietLink}`}>
                  ← Back to login
                </button>
              </form>
            </div>

            {import.meta.env.DEV && (
              <div className={`${auth.devBox} mt-6 p-3 text-center`}>
                <p className={`text-[11px] font-semibold uppercase tracking-widest ${auth.muted} mb-1`}>Dev mode</p>
                <p className={`text-sm ${auth.sub}`}>
                  Any 6-digit code works — e.g.{' '}
                  <button type="button" onClick={() => handleOtpChange('123456')} className={`font-mono ${clientLink}`}>
                    123456
                  </button>
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </AuthShell>
  );
}
