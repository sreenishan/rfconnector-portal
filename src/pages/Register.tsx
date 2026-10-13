import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, ArrowRight, Globe, Building2,
  Mail, ChevronDown, X, Lock, Phone,
} from 'lucide-react';
import AuthShell, { auth } from '../components/AuthShell.tsx';
import { usePageTitle } from '../hooks/usePageTitle';

const REGIONS = [
  { value: 'AF',     label: 'Africa / Ghana',  flag: '🇬🇭', note: 'Ghana DPA 2012' },
  { value: 'EU',     label: 'European Union',  flag: '🇪🇺', note: 'GDPR compliant'  },
  { value: 'SA',     label: 'South America',   flag: '🌎', note: 'LGPD compliant'  },
  { value: 'GLOBAL', label: 'Global',          flag: '🌍', note: 'No restriction'  },
];

// Sandbox removed — API keys require a paid license
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$99',
    period: '/mo',
    features: ['50 chargers', '5k sessions/mo', 'Email support', 'Production access', 'Roaming Marketplace', 'OCPI 2.2 + eMIP', 'EVSE Repository', 'Tariff Exchange'],
    highlight: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$299',
    period: '/mo',
    features: ['500 chargers', '50k sessions/mo', 'Priority email + chat', 'CDR Exchange', 'Eichrecht CDR signing', 'Check & Bill', 'Dispute Management', 'Invoicing module', 'Supervision Dashboard'],
    highlight: true,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited chargers', 'Unlimited sessions', 'Dedicated support + SLA', 'Full roaming suite', 'In-platform Messaging', 'GDPR / Ghana DPA', 'Custom data residency', 'SSO + audit logs', 'Multi-region failover'],
    highlight: false,
  },
];

const COMPARISON = [
  { feature: 'Chargers',               starter: '50',      growth: '500',       enterprise: 'Unlimited' },
  { feature: 'Sessions / mo',          starter: '5 000',   growth: '50 000',    enterprise: 'Unlimited' },
  { feature: 'OCPP 1.6J + 2.0.1',     starter: true,      growth: true,        enterprise: true },
  { feature: 'OCPI 2.2',               starter: true,      growth: true,        enterprise: true },
  { feature: 'eMIP protocol',          starter: true,      growth: true,        enterprise: true },
  { feature: 'Real-time wallet',       starter: true,      growth: true,        enterprise: true },
  { feature: 'Roaming Marketplace',    starter: true,      growth: true,        enterprise: true },
  { feature: 'EVSE Repository',        starter: true,      growth: true,        enterprise: true },
  { feature: 'Tariff Exchange',        starter: true,      growth: true,        enterprise: true },
  { feature: 'CDR Exchange',           starter: false,     growth: true,        enterprise: true },
  { feature: 'Eichrecht CDR',          starter: false,     growth: true,        enterprise: true },
  { feature: 'CDRi (live energy)',      starter: false,     growth: true,        enterprise: true },
  { feature: 'Check & Bill',           starter: false,     growth: true,        enterprise: true },
  { feature: 'Dispute Management',     starter: false,     growth: true,        enterprise: true },
  { feature: 'Invoicing module',       starter: false,     growth: true,        enterprise: true },
  { feature: 'Supervision Dashboard',  starter: false,     growth: true,        enterprise: true },
  { feature: 'In-platform Messaging',  starter: false,     growth: false,       enterprise: true },
  { feature: 'GDPR / Ghana DPA',       starter: false,     growth: false,       enterprise: true },
  { feature: 'SLA',                    starter: false,     growth: false,       enterprise: true },
];

type Step = 'form' | 'success';

const accentText = 'text-brand-600 dark:text-brand-400';

function Cell({ val }: { val: boolean | string }) {
  if (typeof val === 'boolean') {
    return val
      ? <CheckCircle size={14} className="text-charge-500 mx-auto" aria-label="Included" />
      : <X size={14} className="text-gray-300 dark:text-slate-600 mx-auto" aria-label="Not included" />;
  }
  return <span className={`text-xs font-medium ${auth.body}`}>{val}</span>;
}

export default function Register() {
  const navigate = useNavigate();
  usePageTitle('Request access · RFConnector');
  const [step, setStep]       = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [regionOpen, setRegionOpen]       = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const [form, setForm] = useState({
    company: '',
    email:   '',
    phone:   '',
    website: '',
    region:  'AF',
    plan:    'growth',       // default to Growth (most popular paid plan)
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedRegion = REGIONS.find(r => r.value === form.region)!;
  const selectedPlan   = PLANS.find(p => p.id === form.plan)!;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.company.trim()) e['company'] = 'Company name is required';
    if (!form.email.trim())   e['email']   = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e['email'] = 'Enter a valid email';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await fetch('/api/v1/tenants/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
    } catch {
      // backend not yet connected — proceed with mock
    }
    await new Promise(r => setTimeout(r, 1200));

    // Store tenant info WITHOUT an API key — key is issued after license confirmation
    localStorage.setItem('cb_tenant', JSON.stringify({
      company: form.company,
      email:   form.email,
      region:  form.region,
      plan:    form.plan,
      status:  'pending_license',
    }));

    setLoading(false);
    setStep('success');
  }

  const fieldError = (key: string) => errors[key]
    ? <p id={`${key}-error`} role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors[key]}</p>
    : null;

  const inputClass = (key?: string) =>
    `${auth.input} ${key && errors[key] ? '!border-red-500/70 focus:!ring-red-500/30' : ''}`;

  // ── Success screen ─────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <AuthShell>
        <div className="w-full max-w-lg motion-safe:animate-fade-in">
          <div className={`${auth.card} p-8`}>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-brand-500/15 flex items-center justify-center mb-4">
                <CheckCircle size={32} className={accentText} />
              </div>
              <h1 className={`${auth.heading} mb-2`}>Application received!</h1>
              <p className={`${auth.sub} leading-relaxed max-w-sm`}>
                Thank you, <span className="font-medium text-gray-900 dark:text-white">{form.company}</span>. Our team will review your application and confirm your <span className={`font-medium ${accentText}`}>{selectedPlan.name}</span> license within <span className="font-medium text-gray-900 dark:text-white">24 hours</span>.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/80 dark:border-slate-700/60 dark:bg-slate-800/40 p-5 mb-6">
              <p className={`text-xs font-semibold uppercase tracking-wider ${auth.muted} mb-4`}>What happens next</p>
              <ol className="space-y-3">
                {[
                  { step: '1', text: 'License confirmation email sent to ' + form.email },
                  { step: '2', text: 'Complete payment via the secure link in that email' },
                  { step: '3', text: 'API key and onboarding guide sent to your inbox' },
                  { step: '4', text: 'Connect your first charger — we\'re here to help' },
                ].map(({ step: s, text }) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className={`shrink-0 w-6 h-6 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-xs font-bold ${accentText}`}>{s}</span>
                    <p className={`text-sm ${auth.body} leading-relaxed`}>{text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 mb-6">
              <Lock size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-0.5">API key pending license activation</p>
                <p className={`text-sm ${auth.sub}`}>Your API key will be generated and sent to <span className="font-medium text-gray-900 dark:text-slate-200">{form.email}</span> once your payment is confirmed. It will not be shown here.</p>
              </div>
            </div>

            <dl className="grid grid-cols-3 gap-3 mb-6 text-center text-sm">
              {[
                { label: 'Region', value: `${selectedRegion.flag} ${selectedRegion.label}` },
                { label: 'Plan',   value: selectedPlan.name },
                { label: 'Status', value: '⏳ Pending' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-gray-50/80 dark:border-slate-700 dark:bg-slate-800 p-2.5">
                  <dt className={`text-xs ${auth.muted} mb-1`}>{label}</dt>
                  <dd className="font-medium text-gray-900 dark:text-slate-200 truncate">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/dashboard')} className={`${auth.primary} !py-3`}>
                Go to Dashboard <ArrowRight size={15} />
              </button>
              <Link to="/" className={`${auth.secondary} !py-3`}>
                Back to home
              </Link>
            </div>
          </div>

          <p className={`text-center text-sm ${auth.muted} mt-5`}>
            Questions?{' '}
            <a href="mailto:hello@rfconnector.io" className={auth.link}>hello@rfconnector.io</a>
          </p>
        </div>
      </AuthShell>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────

  const aside = (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Licensed access</h2>
        <p className={`${auth.sub} leading-relaxed`}>
          Register your operator account and select a plan. Our team activates your license and emails your API key — usually within 24 hours.
        </p>
      </div>
      <ul className="space-y-3.5">
        {[
          'License reviewed and confirmed by our team',
          'API key emailed after activation',
          'OCPP 1.6J + 2.0.1 support',
          'OCPI 2.2 + eMIP protocols',
          'Roaming Marketplace access',
          'Real-time wallet engine',
          'CDR Exchange + Eichrecht',
          'GDPR & Ghana DPA compliant',
          'Supervision Dashboard',
          'Multi-tenant from day one',
        ].map(text => (
          <li key={text} className={`flex items-center gap-3 text-sm ${auth.body}`}>
            <CheckCircle size={14} className="text-charge-500 shrink-0" />
            {text}
          </li>
        ))}
      </ul>
      <div className="mt-10 rounded-xl border border-gray-200 bg-white/70 dark:border-slate-700/60 dark:bg-slate-800/60 p-4">
        <p className={`text-xs ${auth.muted} mb-1`}>Serving EV operators in</p>
        <p className="text-sm font-medium text-gray-900 dark:text-slate-200">🇬🇭 Ghana · 🇪🇺 Europe · 🌎 LatAm · 🌍 Global</p>
      </div>
    </>
  );

  const headerRight = (
    <span className={`hidden sm:inline text-sm ${auth.muted}`}>
      Already licensed?{' '}
      <Link to="/login" className={auth.link}>Sign in</Link>
    </span>
  );

  return (
    <AuthShell aside={aside} headerRight={headerRight}>
      <div className="w-full max-w-2xl motion-safe:animate-fade-in">
        <h1 className={`${auth.heading} mb-1`}>Request access</h1>
        <p className={`${auth.sub} mb-8`}>
          Fill in your details and select a plan. Your API key is issued after license confirmation — not before.
        </p>

        <form onSubmit={handleSubmit} className={`${auth.card} p-6 sm:p-8 space-y-5`}>

          <div>
            <label htmlFor="reg-company" className={auth.label}>
              <Building2 size={13} className="inline mr-1.5 -mt-0.5" />Company / App name
            </label>
            <input
              id="reg-company"
              type="text"
              autoComplete="organization"
              value={form.company}
              onChange={e => { setForm(f => ({ ...f, company: e.target.value })); setErrors(v => ({ ...v, company: '' })); }}
              placeholder="Acme EV Inc."
              aria-invalid={!!errors['company']}
              aria-describedby={errors['company'] ? 'company-error' : undefined}
              className={inputClass('company')}
            />
            {fieldError('company')}
          </div>

          <div>
            <label htmlFor="reg-email" className={auth.label}>
              <Mail size={13} className="inline mr-1.5 -mt-0.5" />Work email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(v => ({ ...v, email: '' })); }}
              placeholder="you@company.com"
              aria-invalid={!!errors['email']}
              aria-describedby={errors['email'] ? 'email-error' : undefined}
              className={inputClass('email')}
            />
            {fieldError('email')}
          </div>

          <div>
            <label htmlFor="reg-phone" className={auth.label}>
              <Phone size={13} className="inline mr-1.5 -mt-0.5" />Phone number <span className={`font-normal ${auth.muted}`}>(optional)</span>
            </label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+233 20 000 0000"
              className={inputClass()}
            />
          </div>

          <div>
            <span id="reg-region-label" className={auth.label}>
              <Globe size={13} className="inline mr-1.5 -mt-0.5" />Data residency region
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setRegionOpen(!regionOpen)}
                aria-haspopup="listbox"
                aria-expanded={regionOpen}
                aria-labelledby="reg-region-label"
                className={`${auth.input} flex items-center justify-between text-left`}
              >
                <span className="flex items-center gap-2">
                  <span>{selectedRegion.flag}</span>
                  <span>{selectedRegion.label}</span>
                  <span className={`text-xs ${auth.muted}`}>({selectedRegion.note})</span>
                </span>
                <ChevronDown size={15} className={`${auth.muted} transition-transform ${regionOpen ? 'rotate-180' : ''}`} />
              </button>
              {regionOpen && (
                <ul
                  role="listbox"
                  aria-labelledby="reg-region-label"
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white/95 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-10 overflow-hidden"
                >
                  {REGIONS.map(r => (
                    <li key={r.value} role="option" aria-selected={form.region === r.value}>
                      <button
                        type="button"
                        onClick={() => { setForm(f => ({ ...f, region: r.value })); setRegionOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-slate-700 ${
                          form.region === r.value ? `bg-brand-500/10 ${accentText}` : auth.body
                        }`}
                      >
                        <span>{r.flag}</span>
                        <span>{r.label}</span>
                        <span className={`ml-auto text-xs ${auth.muted}`}>{r.note}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <fieldset>
            <legend className="sr-only">License plan</legend>
            <div className="flex items-center justify-between mb-2">
              <span aria-hidden="true" className="text-sm font-medium text-gray-700 dark:text-slate-300">License plan</span>
              <button
                type="button"
                onClick={() => setShowComparison(v => !v)}
                aria-expanded={showComparison}
                className={`text-sm ${auth.link}`}
              >
                {showComparison ? 'Hide comparison' : 'Compare plans →'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  type="button"
                  aria-pressed={form.plan === plan.id}
                  onClick={() => setForm(f => ({ ...f, plan: plan.id }))}
                  className={`relative rounded-xl border p-4 text-left transition-all ${auth.focusRing} ${
                    form.plan === plan.id
                      ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500'
                      : 'border-gray-200 bg-white/90 hover:border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-semibold text-white whitespace-nowrap">
                      Most popular
                    </span>
                  )}
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{plan.name}</p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-charge-400">
                    {plan.price}<span className={`text-xs font-normal ${auth.muted}`}>{plan.period}</span>
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/80 dark:border-slate-700/60 dark:bg-slate-800/50 p-4">
              <p className={`text-xs font-semibold ${auth.sub} mb-2`}>{selectedPlan.name} includes:</p>
              <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-x-4 gap-y-1.5">
                {selectedPlan.features.map(f => (
                  <li key={f} className={`flex items-center gap-1.5 text-sm ${auth.body}`}>
                    <CheckCircle size={12} className="text-charge-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {selectedPlan.id === 'enterprise' && (
              <p className={`mt-2 text-sm ${auth.muted} flex items-center gap-1.5`}>
                <Mail size={12} />
                Enterprise plan requires a call — we'll reach out to discuss your requirements.
              </p>
            )}
          </fieldset>

          {showComparison && (
            <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100 dark:border-slate-700">
                      <th scope="col" className={`text-left px-4 py-3 font-medium ${auth.sub}`}>Feature</th>
                      {PLANS.map(p => (
                        <th key={p.id} scope="col" className={`px-3 py-3 text-center font-semibold ${form.plan === p.id ? accentText : auth.sub}`}>
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map(({ feature, starter, growth, enterprise }, i) => (
                      <tr key={feature} className={`border-b border-gray-100 dark:border-slate-800 ${i % 2 === 0 ? 'bg-gray-50/60 dark:bg-slate-900/20' : ''}`}>
                        <th scope="row" className={`px-4 py-2.5 text-left font-normal ${auth.sub}`}>{feature}</th>
                        <td className="px-3 py-2.5 text-center"><Cell val={starter} /></td>
                        <td className="px-3 py-2.5 text-center"><Cell val={growth} /></td>
                        <td className="px-3 py-2.5 text-center"><Cell val={enterprise} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <Lock size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className={`text-sm ${auth.sub}`}>
              Your API key will be <span className="font-medium text-amber-800 dark:text-amber-300">emailed to you after license activation</span> — it will not be shown on screen. Keep your registered email accessible.
            </p>
          </div>

          <p className={`text-sm ${auth.muted}`}>
            By submitting you agree to our{' '}
            <span className="font-medium text-gray-700 dark:text-slate-300">Terms of Service</span> and{' '}
            <span className="font-medium text-gray-700 dark:text-slate-300">Privacy Policy</span>.
          </p>

          <button type="submit" disabled={loading} className={`${auth.primary} !py-3.5`}>
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                Submitting application…
              </>
            ) : (
              <>Request Access <ArrowRight size={15} /></>
            )}
          </button>

          <p className={`sm:hidden text-center text-sm ${auth.muted}`}>
            Already licensed? <Link to="/login" className={auth.link}>Sign in</Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
