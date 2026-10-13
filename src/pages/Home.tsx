import { Link } from 'react-router-dom';
import {
  Zap, Globe, Shield, Wallet, Activity, ArrowRight,
  CheckCircle, Code2, Plug, BarChart3, Lock, Network,
  Database, FileText, MessageSquare, AlertTriangle,
  TrendingUp, Layers, GitMerge, Cpu, Receipt,
  User, Building2, Terminal, BatteryCharging, Wifi,
  LineChart, HandshakeIcon, Rocket, MousePointerClick,
} from 'lucide-react';
import Navbar from '../components/Navbar.tsx';
import Footer from '../components/Footer.tsx';
import { usePageTitle } from '../hooks/usePageTitle';

// ── Data ──────────────────────────────────────────────────────────────────────

const featureGroups = [
  {
    title: 'Protocols & connectivity',
    icon: Plug,
    items: [
      { icon: Plug,          title: 'OCPP 1.6J & 2.0.1',         desc: 'Native WebSocket adapter for any OCPP-compliant charger. Auto protocol negotiation, heartbeat watchdog, remote start/stop.' },
      { icon: Globe,         title: 'OCPI 2.2 + eMIP',            desc: '3-step credential exchange, location sync, CDR push, token whitelist — plus full eMIP protocol support for pan-European interoperability.' },
      { icon: Database,      title: 'Real-time EVSE Repository',  desc: 'Centralised charge point data with live availability status. Filter by location, connector type, power level, and operator network.' },
      { icon: GitMerge,      title: 'Smart Onboarding',           desc: 'IT Workshop documentation, sandbox certification environment, and guided testing tools so every new CPO or eMSP goes live in days, not months.' },
    ],
  },
  {
    title: 'Roaming',
    icon: Network,
    items: [
      { icon: Network,       title: 'Roaming Marketplace',        desc: 'B2B marketplace connecting CPOs and eMSPs globally. Browse networks, negotiate roaming agreements, and activate one-click e-signatures.' },
      { icon: TrendingUp,    title: 'Tariff Exchange',            desc: 'Real-time tariff database with OCPI and eMIP APIs. Push and pull pricing per kWh, per minute, and flat fees across roaming partners.' },
      { icon: FileText,      title: 'CDR Exchange + Eichrecht',   desc: 'Intermediate CDRs (CDRi) with live energy updates during the session. Full Eichrecht-compliant CDR with 3-identifier tracking for metering law.' },
      { icon: MessageSquare, title: 'In-platform Messaging',      desc: 'Secure messaging with roaming partners, CPOs, and eMSPs — all without leaving the portal. Thread history and read receipts included.' },
    ],
  },
  {
    title: 'Billing & settlement',
    icon: Receipt,
    items: [
      { icon: Wallet,        title: 'Real-time Wallet Engine',    desc: 'Reserve on start → deduct per meter event → auto-stop at zero. Idempotent deductions with SHA-256 keyed ledger.' },
      { icon: Receipt,       title: 'Check & Bill Automation',    desc: 'Automated quality control, price recalculation, and benchmarking against roaming agreements. Detect billing discrepancies before they become disputes.' },
      { icon: AlertTriangle, title: 'Dispute Management',         desc: 'Centralised dispute repository with creation, follow-up, and email notifications. Track every challenge across sessions, CDRs, and billing cycles.' },
      { icon: Layers,        title: 'Automated Invoicing',        desc: 'Generate, delegate, and distribute invoices for roaming sessions automatically. Supports multi-currency, cross-border VAT rules, and PDF export.' },
    ],
  },
  {
    title: 'Platform & security',
    icon: Shield,
    items: [
      { icon: Shield,        title: 'GDPR + Ghana DPA Ready',     desc: 'AES-256-GCM PII encryption, right-to-erasure pipeline, immutable audit logs, and per-region data residency pools.' },
      { icon: Activity,      title: 'Multi-tenant Isolation',     desc: 'PostgreSQL Row-Level Security + Redis key namespacing. Tenant A can never touch Tenant B data — enforced at the DB layer.' },
      { icon: BarChart3,     title: 'TimescaleDB Meter History',  desc: 'Every watt-hour recorded as a time-series event. Query session energy curves, power peaks, and billing data in milliseconds.' },
      { icon: Cpu,           title: 'Supervision Dashboard',      desc: 'Real-time status monitoring for your platform and all roaming partners. Instant alerts on protocol errors, timeout anomalies, and network outages.' },
    ],
  },
];

const protocols = [
  { name: 'OCPP 1.6J',  note: 'WebSocket, JSON'         },
  { name: 'OCPP 2.0.1', note: 'WebSocket, JSON'         },
  { name: 'OCPI 2.2',   note: 'REST, CDR, tokens'       },
  { name: 'eMIP 3.x',   note: 'SOAP/REST, EU roaming'   },
  { name: 'RFID Auth',  note: 'Sync + async, whitelist' },
  { name: 'Eichrecht',  note: 'German metering law'     },
];

const steps = [
  { n: '01', title: 'Register your tenant',  desc: 'Create an account, choose your data-residency region, and select a plan. Our team confirms your license and sends your API key within 24 hours.' },
  { n: '02', title: 'Connect a charger',     desc: 'Point your OCPP client at wss://api.rfconnector.io/ocpp/<chargerId>. Auto-negotiates 1.6J or 2.0.1.' },
  { n: '03', title: 'Join the Marketplace',  desc: 'Browse CPO and eMSP networks, negotiate roaming agreements, and activate with one-click e-signature.' },
  { n: '04', title: 'Start sessions & bill', desc: 'POST /v1/sessions/start — wallet reserved, CDRi generated live, automatic Check & Bill, Eichrecht-compliant CDR.' },
];

const stats = [
  { label: 'API endpoints', value: '32+'   },
  { label: 'OCPP versions', value: '2'     },
  { label: 'Protocols',     value: '3'     },
  { label: 'Uptime SLA',    value: '99.9%' },
];

const roamingStats = [
  { label: 'Charge point networks', value: '1 000+'  },
  { label: 'eMSP partners',         value: '320+'    },
  { label: 'Roaming agreements',    value: '13 000+' },
  { label: 'Countries covered',     value: '32'      },
];

// The original 12 pipeline steps, in order, grouped into three lifecycle phases.
const pipelinePhases = [
  { n: '01', name: 'Agree',    accent: 'bg-brand-500',  steps: ['Market Place', 'Negotiation', 'Signature'] },
  { n: '02', name: 'Exchange', accent: 'bg-cyan-500',   steps: ['Repository', 'Tariffs', 'Auth', 'CDRi', 'CDR'] },
  { n: '03', name: 'Settle',   accent: 'bg-charge-500', steps: ['Supervision', 'Check & Bill', 'Disputes', 'Invoicing'] },
];

const valueProps = [
  { icon: Rocket,            title: 'Boost your business',          desc: 'Access 1 000+ operator networks and 320+ eMSPs through a single marketplace. Accelerate ROI on charging infrastructure.' },
  { icon: MousePointerClick, title: 'Connect in a single click',    desc: 'One IT connection replaces dozens of bilateral integrations. OCPI and eMIP supported — no custom protocol work.' },
  { icon: HandshakeIcon,     title: 'Simplify the user experience', desc: 'Transparent tariffs, live CDRi updates, and seamless cross-network auth mean EV drivers never hit a dead end.' },
  { icon: Shield,            title: 'Secure every transaction',     desc: 'AES-256-GCM encryption, Eichrecht-compliant CDR signing, TLS 1.3 enforced, and immutable audit logs throughout.' },
];

const solutions = [
  { icon: Globe,           title: 'EV Roaming',       desc: 'B2B marketplace, agreements & CDR exchange across 32 countries' },
  { icon: BatteryCharging, title: 'Plug & Charge',    desc: 'ISO-15118 vehicle plug-in auto-auth — no RFID, no app needed' },
  { icon: Wifi,            title: 'Smart Charging',   desc: 'TSO/DSO flexibility integration, load balancing & demand response' },
  { icon: LineChart,       title: 'Data & Analytics', desc: 'Data-as-a-Service: CDR quality, market insights & compliance' },
];

const securityItems = [
  'Argon2id API key hashing', 'AES-256-GCM PII encryption',
  'RS256 JWT (4096-bit)',      'TLS 1.3 enforced',
  'PostgreSQL RLS',            'Immutable audit logs',
  'GDPR right-to-erasure',     'Ghana DPA 2012',
  'LGPD (Brazil)',             'Per-region data pools',
  'Eichrecht CDR signing',     'SOC 2 roadmap',
];

const plans = [
  { name: 'Starter',    price: '$99',    period: '/mo', items: ['50 chargers', 'Marketplace access'],               highlight: false, cta: 'Request access', to: '/register' },
  { name: 'Growth',     price: '$299',   period: '/mo', items: ['500 chargers', 'CDR exchange', 'Tariffs'],          highlight: true,  cta: 'Request access', to: '/register' },
  { name: 'Enterprise', price: 'Custom', period: '',    items: ['Unlimited chargers', 'Full roaming suite', 'SLA'], highlight: false, cta: 'Contact sales',  to: 'mailto:hello@rfconnector.io' },
];

const partners = [
  'Ionity', 'Shell Recharge', 'EnBW', 'EVBox',
  'Allego', 'ChargeMap', 'Porsche', 'TotalEnergies',
];

// Shared class tokens. `bg-white` is avoided because index.css force-overrides it in dark mode.
const eyebrow  = 'text-xs font-bold uppercase tracking-[0.2em] mb-3 text-brand-600 dark:text-brand-400';
const heading  = 'font-bold text-gray-900 dark:text-white';
const subtext  = 'text-gray-600 dark:text-slate-400';
const muted    = 'text-gray-500 dark:text-slate-500';
const divider  = 'border-t border-gray-200 dark:border-slate-800/60';
const altBg    = 'bg-white/60 dark:bg-slate-900/25';
const card     = 'border border-gray-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/60';
const accentIcon = 'text-brand-600 dark:text-brand-400';
const iconTile = 'bg-brand-500/10 border border-brand-500/20';
const lift     = 'motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5';

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  usePageTitle('RFConnector — Universal EV Charging Connector SDK');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 antialiased">
      <Navbar />

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-24 px-4 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(99,102,241,0.18) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[640px] h-[640px] rounded-full bg-brand-600/10 dark:bg-brand-600/20 blur-[128px]" />
          <div className="absolute top-32 -right-20 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
          <div className="absolute -bottom-20 left-0 w-[400px] h-[400px] rounded-full bg-charge-500/10 blur-[100px]" />
        </div>
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-gray-50 dark:from-slate-950 to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 mb-8 backdrop-blur-sm text-balance">
            <Zap size={11} className="shrink-0" />
            Built for Ghana, EU &amp; LatAm · OCPP + OCPI + eMIP · v1.0
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[5.25rem] font-extrabold tracking-tight leading-[1.04] mb-6 text-gray-900 dark:text-white">
            The Universal{' '}
            <span className="gradient-text whitespace-nowrap">EV Charging</span>
            <br />Connector SDK
          </h1>

          <p className={`text-lg sm:text-xl ${subtext} max-w-2xl mx-auto mb-10 leading-relaxed text-balance`}>
            One API to connect any charge point network to any mobile or web app —
            with roaming, billing and compliance built in.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98] px-8 py-3.5 text-sm font-semibold text-white transition-all shadow-xl shadow-brand-600/30"
            >
              Request Access
              <ArrowRight size={15} className="motion-safe:group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/70 text-gray-700 hover:border-gray-400 hover:text-gray-900 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:scale-[0.98] px-8 py-3.5 text-sm font-medium transition-all backdrop-blur-sm"
            >
              <Code2 size={15} />
              Explore features
            </a>
          </div>

          <dl className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 mb-16">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex items-baseline gap-2">
                <dt className="sr-only">{label}</dt>
                <dd className="text-2xl font-black gradient-text tabular-nums">{value}</dd>
                <dd aria-hidden="true" className={`text-sm ${muted}`}>{label}</dd>
              </div>
            ))}
          </dl>

          {/* Code terminal — intentionally dark in both themes */}
          <div className="mx-auto max-w-2xl rounded-2xl overflow-hidden border border-slate-700/70 bg-slate-900 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.45)] text-left">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-charge-500/70" />
              <span className="ml-2 text-xs text-gray-400 font-mono">start_session.sh</span>
            </div>
            <div className="p-5 font-mono text-xs leading-7 overflow-x-auto text-gray-300">
              <p className="text-gray-500"># Start a roaming-enabled charging session</p>
              <p className="mt-1">
                <span className="text-cyan-400">curl</span>
                <span> -X POST https://api.rfconnector.io/v1/sessions/start \</span>
              </p>
              <p>
                <span>  -H </span>
                <span className="text-amber-300">"Authorization: Bearer rfc_your_api_key"</span>
                <span> \</span>
              </p>
              <p>
                <span>  -d </span>
                <span className="text-amber-300">'{"{"}"driverId":"drv_abc","portId":"port_gh_001","tariffRatePerKwh":0.50,"roaming":true{"}"}'</span>
              </p>
              <p className="mt-3 text-gray-500"># Response — CDRi begins streaming immediately</p>
              <p><span className="text-charge-400">{"{"}</span></p>
              <p>
                <span>  </span>
                <span className="text-brand-400">"data"</span>
                <span>: {"{"}</span>
                <span className="text-brand-400">"sessionId"</span>
                <span>: </span>
                <span className="text-amber-300">"ses_01J..."</span>
                <span>, </span>
                <span className="text-brand-400">"status"</span>
                <span>: </span>
                <span className="text-amber-300">"active"</span>
                <span>, </span>
                <span className="text-brand-400">"cdrStream"</span>
                <span>: </span>
                <span className="text-amber-300">"wss://..."</span>
                <span>{"}"}</span>
              </p>
              <p><span className="text-charge-400">{"}"}</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUSTED BY — marquee ═══════════════════════════════════════════ */}
      <div className="border-y border-gray-200 dark:border-slate-800/60 py-10 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
        <p className={`text-center text-xs font-bold uppercase tracking-[0.2em] ${muted} mb-6`}>
          Trusted by leading EV operators &amp; service providers
        </p>
        <div className="animate-marquee">
          {[...partners, ...partners].map((name, i) => (
            <span
              key={i}
              aria-hidden={i >= partners.length}
              className="text-sm font-semibold text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors tracking-widest uppercase whitespace-nowrap px-8"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ CHOOSE YOUR PORTAL ═════════════════════════════════════════════ */}
      <section id="choose-portal" className="py-24 px-4">
        <div className="mx-auto max-w-6xl" data-reveal>
          <div className="text-center mb-14">
            <p className={eyebrow}>Find your access point</p>
            <h2 className={`text-3xl sm:text-4xl ${heading} mb-4`}>
              Choose your <span className="gradient-text">portal</span>
            </h2>
            <p className={`${subtext} max-w-md mx-auto text-base leading-relaxed`}>
              RFConnector powers three distinct experiences — pick the role built for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-stretch">

            {/* Client */}
            <div className={`group relative rounded-2xl ${card} hover:border-charge-500/50 dark:hover:border-charge-500/50 p-6 flex flex-col transition-colors duration-300 motion-safe:transition-all motion-safe:hover:-translate-y-1.5`}>
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 0 48px -12px rgba(16,185,129,0.25)' }}
              />
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-charge-500/15 border border-charge-500/20 flex items-center justify-center">
                  <User size={18} className="text-charge-600 dark:text-charge-400" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-charge-600 dark:text-charge-400 border border-charge-500/25 bg-charge-500/10 rounded-full px-2.5 py-1">
                  EV Users
                </span>
              </div>
              <h3 className={`text-lg ${heading} mb-2`}>Client</h3>
              <p className={`text-sm ${subtext} leading-relaxed mb-5`}>
                Track your live charging sessions, monitor wallet balance, download CDRs, and review invoices — all from one dashboard.
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {['Live session monitoring', 'Wallet & balance overview', 'CDR & invoice history', 'Energy usage analytics'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                    <CheckCircle size={14} className="text-charge-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link
                to="/client-login"
                className="group/btn flex items-center justify-center gap-2 rounded-xl border border-charge-500/30 bg-charge-500/10 py-2.5 text-sm font-semibold text-charge-600 dark:text-charge-400 hover:bg-charge-500/20 hover:border-charge-500/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-charge-400 transition-all"
              >
                Enter Client Portal <ArrowRight size={14} className="motion-safe:group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Vendor — featured */}
            <div className="group relative rounded-2xl gradient-border p-6 flex flex-col motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-1.5">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 via-cyan-500 to-charge-500 px-3.5 py-1 text-[11px] font-bold text-white whitespace-nowrap shadow-lg">
                <Zap size={9} /> For operators
              </div>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none glow-brand" />
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                  <Building2 size={18} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 bg-cyan-500/10 rounded-full px-2.5 py-1">
                  CPOs &amp; Vendors
                </span>
              </div>
              <h3 className={`text-lg ${heading} mb-2`}>Vendor</h3>
              <p className={`text-sm ${subtext} leading-relaxed mb-5`}>
                Operate your charge point network end-to-end — manage tariffs, monitor OCPP connections, join the roaming marketplace, and reconcile billing.
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {['OCPP 1.6J & 2.0.1 management', 'Tariff & pricing engine', 'Roaming marketplace access', 'CDR exchange & Eichrecht', 'Supervision dashboard'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                    <CheckCircle size={14} className="text-cyan-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className="group/btn flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-brand-600/25"
              >
                Enter Vendor Portal <ArrowRight size={14} className="motion-safe:group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Developer */}
            <div className={`group relative rounded-2xl ${card} hover:border-brand-500/50 dark:hover:border-brand-500/50 p-6 flex flex-col transition-colors duration-300 motion-safe:transition-all motion-safe:hover:-translate-y-1.5`}>
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 0 48px -12px rgba(99,102,241,0.3)' }}
              />
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
                  <Terminal size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 border border-brand-500/25 bg-brand-500/10 rounded-full px-2.5 py-1">
                  Builders
                </span>
              </div>
              <h3 className={`text-lg ${heading} mb-2`}>Developer</h3>
              <p className={`text-sm ${subtext} leading-relaxed mb-5`}>
                Integrate the RFConnector SDK into your app. Get API keys, explore 32+ endpoints, test with our sandbox, and go live in days — not months.
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {['REST API + WebSocket SDK', 'Sandbox & testing tools', 'Webhook management', 'API key dashboard'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                    <CheckCircle size={14} className="text-brand-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="group/btn flex items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 hover:border-brand-500/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400 transition-all"
              >
                Get API keys <ArrowRight size={14} className="motion-safe:group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

          </div>
          <p className={`text-center text-sm ${muted} mt-6`}>
            Not sure which portal is right for you?{' '}
            <a href="mailto:hello@rfconnector.io" className="text-gray-700 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
              Contact us →
            </a>
          </p>
        </div>
      </section>

      {/* ═══ WHY RFCONNECTOR + SOLUTIONS ════════════════════════════════════ */}
      <section className={`py-24 px-4 ${divider} ${altBg}`}>
        <div className="mx-auto max-w-6xl" data-reveal>
          <div className="text-center mb-14">
            <p className={eyebrow}>Why RFConnector</p>
            <h2 className={`text-3xl sm:text-4xl ${heading} mb-4`}>Built for the serious EV ecosystem</h2>
            <p className={`${subtext} max-w-xl mx-auto text-base leading-relaxed`}>
              One platform. Every protocol. Every roaming flow. From a single charger to 700 000+ charge points across 32 countries.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {valueProps.map(({ icon: Icon, title, desc }) => (
              <div key={title} className={`rounded-2xl ${card} p-6 ${lift}`}>
                <div className={`w-10 h-10 rounded-xl ${iconTile} flex items-center justify-center mb-5`}>
                  <Icon size={18} className={accentIcon} />
                </div>
                <h3 className={`text-base ${heading} mb-2`}>{title}</h3>
                <p className={`text-sm ${subtext} leading-relaxed`}>{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <h3 className={`text-center text-xl sm:text-2xl ${heading} mb-8`}>Every EV mobility vertical, covered</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
              {solutions.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <Icon size={20} className={`${accentIcon} shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-sm ${heading} mb-1`}>{title}</p>
                    <p className={`text-sm ${subtext} leading-relaxed`}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ROAMING PIPELINE ═══════════════════════════════════════════════ */}
      <section className={`py-24 px-4 ${divider}`}>
        <div className="mx-auto max-w-6xl" data-reveal>
          <div className="text-center mb-14">
            <p className={eyebrow}>End-to-end EV roaming</p>
            <h2 className={`text-3xl sm:text-4xl ${heading} mb-4`}>Full roaming pipeline, one platform</h2>
            <p className={`${subtext} max-w-xl mx-auto text-base leading-relaxed`}>
              From marketplace discovery to automated invoicing — every step of the roaming lifecycle built in.
            </p>
          </div>

          <ol className="grid md:grid-cols-3 gap-5 mb-10">
            {pipelinePhases.map(({ n, name, accent, steps: phaseSteps }) => (
              <li key={name} className={`relative rounded-2xl ${card} p-6 overflow-hidden`}>
                <div className={`absolute top-0 inset-x-0 h-1 ${accent}`} />
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="font-mono text-sm font-bold text-gray-400 dark:text-slate-500 tabular-nums">{n}</span>
                  <h3 className={`text-lg ${heading}`}>{name}</h3>
                </div>
                <ol className="flex flex-wrap gap-2">
                  {phaseSteps.map(step => (
                    <li key={step} className="rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 px-3 py-1 text-sm text-gray-700 dark:text-slate-300">
                      {step}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>

          <div className={`rounded-2xl ${card} p-8`}>
            <p className={`text-center text-xs font-bold uppercase tracking-[0.2em] ${muted} mb-8`}>
              Network reach via RFConnector Roaming
            </p>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {roamingStats.map(({ label, value }) => (
                <div key={label} className="flex flex-col-reverse">
                  <dt className={`text-sm ${muted} mt-1`}>{label}</dt>
                  <dd className="text-3xl font-black gradient-text tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══════════════════════════════════════════════════════ */}
      <section id="features" className={`py-24 px-4 ${divider} ${altBg}`}>
        <div className="mx-auto max-w-6xl" data-reveal>
          <div className="text-center mb-12">
            <p className={eyebrow}>Platform capabilities</p>
            <h2 className={`text-3xl sm:text-4xl ${heading} mb-4`}>Everything you need to ship EV charging</h2>
            <p className={`${subtext} max-w-xl mx-auto text-base leading-relaxed`}>
              One SDK. Every charging protocol. Full roaming lifecycle. Production-grade security and compliance out of the box.
            </p>
          </div>

          {/* Protocol support */}
          <div className="mb-12 text-center">
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${muted} mb-4`}>Protocol support</p>
            <ul className="flex flex-wrap justify-center gap-2.5">
              {protocols.map(({ name, note }) => (
                <li key={name} className={`rounded-full ${card} px-4 py-1.5 text-sm`}>
                  <span className={`font-semibold ${accentIcon}`}>{name}</span>
                  <span className={`${muted}`}> · {note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {featureGroups.map(({ title, icon: GroupIcon, items }) => (
              <div key={title} className={`rounded-2xl ${card} p-6 sm:p-8`}>
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-200 dark:border-slate-800">
                  <div className={`w-10 h-10 rounded-xl ${iconTile} flex items-center justify-center`}>
                    <GroupIcon size={18} className={accentIcon} />
                  </div>
                  <h3 className={`text-lg ${heading}`}>{title}</h3>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
                  {items.map(({ icon: Icon, title: itemTitle, desc }) => (
                    <li key={itemTitle}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon size={15} className={`${accentIcon} shrink-0`} />
                        <h4 className={`text-sm ${heading}`}>{itemTitle}</h4>
                      </div>
                      <p className={`text-sm ${subtext} leading-relaxed`}>{desc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════════════════════ */}
      <section id="how-it-works" className={`py-24 px-4 ${divider}`}>
        <div className="mx-auto max-w-4xl" data-reveal>
          <div className="text-center mb-16">
            <p className={eyebrow}>Integration in 4 steps</p>
            <h2 className={`text-3xl sm:text-4xl ${heading}`}>From zero to roaming in minutes</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {steps.map(({ n, title, desc }) => (
              <div
                key={n}
                className={`flex gap-5 p-6 rounded-2xl ${card} hover:border-gray-300 dark:hover:border-slate-700 transition-colors duration-200`}
              >
                <div className="shrink-0 text-3xl font-black gradient-text font-mono leading-none mt-0.5 tabular-nums select-none">{n}</div>
                <div>
                  <h3 className={`text-base ${heading} mb-2 leading-snug`}>{title}</h3>
                  <p className={`text-sm ${subtext} leading-relaxed`}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECURITY ═══════════════════════════════════════════════════════ */}
      <section className={`py-20 px-4 ${divider} ${altBg}`}>
        <div className="mx-auto max-w-4xl" data-reveal>
          <div className={`rounded-2xl ${card} p-8 md:flex items-center gap-10`}>
            <div className="flex-1 mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-7 h-7 rounded-lg ${iconTile} flex items-center justify-center`}>
                  <Lock size={13} className={accentIcon} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${accentIcon}`}>Enterprise Security</span>
              </div>
              <h3 className={`text-xl ${heading} mb-5`}>Security-first by design</h3>
              <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-y-2.5 gap-x-8">
                {securityItems.map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-charge-500 shrink-0" />
                    <span className={`text-sm ${subtext}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to="/register"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400 active:scale-[0.98] px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-brand-600/20 whitespace-nowrap"
            >
              Start building <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ════════════════════════════════════════════════════════ */}
      <section id="pricing" className={`py-24 px-4 ${divider}`}>
        <div className="mx-auto max-w-5xl" data-reveal>
          <div className="text-center mb-14">
            <p className={eyebrow}>Licensed access</p>
            <h2 className={`text-3xl sm:text-4xl ${heading} mb-4`}>Transparent pricing, licensed access</h2>
            <p className={`${subtext} text-base max-w-lg mx-auto`}>
              API keys are issued after license confirmation — your data and operations are always protected.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {plans.map(({ name, price, period, items, highlight, cta, to }) => {
              const ctaClass = `mt-6 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                highlight
                  ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25'
                  : 'border border-gray-300 text-gray-800 hover:border-brand-500 hover:text-brand-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-white'
              }`;
              return (
                <div
                  key={name}
                  className={`rounded-2xl p-6 flex flex-col ${lift} ${
                    highlight
                      ? 'border border-brand-500/50 bg-brand-500/8 hover:border-brand-500/80'
                      : `${card} hover:border-gray-300 dark:hover:border-slate-700`
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 min-h-[1.25rem]">
                    <p className={`text-base ${heading}`}>{name}</p>
                    {highlight && <p className={`text-[11px] font-bold uppercase tracking-widest ${accentIcon}`}>Most popular</p>}
                  </div>
                  <div className="flex items-baseline gap-0.5 mb-5">
                    <span className="text-3xl font-extrabold gradient-text tabular-nums">{price}</span>
                    {period && <span className={`text-sm ${muted}`}>{period}</span>}
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {items.map(item => (
                      <li key={item} className={`flex items-center gap-2.5 text-sm ${subtext}`}>
                        <CheckCircle size={14} className="text-charge-500 shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                  {to.startsWith('mailto:')
                    ? <a href={to} className={ctaClass}>{cta}</a>
                    : <Link to={to} className={ctaClass}>{cta} <ArrowRight size={14} /></Link>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════════════════════ */}
      <section className={`relative py-28 px-4 overflow-hidden ${divider}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(rgba(99,102,241,0.12) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-charge-500/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-full h-[400px] rounded-full bg-brand-600/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center" data-reveal>
          <p className={`${eyebrow} !mb-5`}>Get started today</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight">
            Ready to connect<br />your first charger?
          </h2>
          <p className={`${subtext} mb-10 text-base leading-relaxed max-w-lg mx-auto`}>
            Join operators in Ghana, Europe and LatAm building the next generation of EV roaming infrastructure.
            API key issued after license activation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:scale-[0.98] px-10 py-4 text-base font-semibold text-white transition-all shadow-2xl shadow-brand-600/30"
            >
              Request Access
              <ArrowRight size={18} className="motion-safe:group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="mailto:hello@rfconnector.io"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400 rounded px-2 py-1"
            >
              Talk to sales →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
