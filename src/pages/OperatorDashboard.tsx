/**
 * ChargeBridge — Operator Back-office Dashboard
 * Route: /dashboard  (on app.chargebridge.io)
 *
 * Sections: Overview · Clients · Vendors · Payments · API Keys
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OPERATOR_SESSION_KEY, type OperatorSession } from './DeveloperLogin.tsx';
import { CLIENT_BASE_URL } from '../lib/hostConfig.ts';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTheme } from '../hooks/useTheme';
import {
  Zap, LayoutDashboard, Building2, Network, CreditCard, Key,
  LogOut, Plus, Search, CheckCircle, XCircle,
  Clock, AlertTriangle, Copy, Eye, EyeOff, RefreshCw, Trash2,
  Globe, Users, Activity, DollarSign,
  Wifi, WifiOff, X, Check, ExternalLink, Sun, Moon,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type NavId = 'overview' | 'clients' | 'vendors' | 'payments' | 'apikeys';

interface Client {
  id: string; company: string; contact: string; email: string;
  plan: 'starter' | 'growth' | 'enterprise'; status: 'active' | 'pending' | 'suspended';
  portalUsers: number; contractSince: string; mrr: number;
}

interface Vendor {
  id: string; name: string; type: string; country: string;
  ocpiVersion: string; status: 'connected' | 'pending' | 'error';
  endpoint: string; sessions: number;
}

interface Invoice {
  id: string; client: string; period: string; amount: number;
  status: 'paid' | 'pending' | 'overdue'; dueDate: string;
}

interface ApiKeyEntry {
  id: string; label: string; keyPreview: string;
  created: string; lastUsed: string;
  permissions: string[]; revealed: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', company: 'Volta Networks',  contact: 'João Silva',    email: 'joao@volta.io',         plan: 'growth',      status: 'active',    portalUsers: 3, contractSince: '2024-01-15', mrr: 299  },
  { id: 'c2', company: 'PowerGrid LatAm', contact: 'Maria Santos',  email: 'maria@powergrid.io',    plan: 'starter',     status: 'active',    portalUsers: 1, contractSince: '2024-03-01', mrr: 99   },
  { id: 'c3', company: 'EV Fleet Co',     contact: 'Carlos Lima',   email: 'carlos@evfleet.com',    plan: 'enterprise',  status: 'active',    portalUsers: 5, contractSince: '2023-11-20', mrr: 1400 },
  { id: 'c4', company: 'GreenMobility SA',contact: 'Ana Costa',     email: 'ana@greenmobility.sa',  plan: 'growth',      status: 'pending',   portalUsers: 0, contractSince: '2025-05-01', mrr: 299  },
  { id: 'c5', company: 'ChargeFlow GH',   contact: 'Kwame Asante',  email: 'kwame@chargeflow.gh',   plan: 'starter',     status: 'suspended', portalUsers: 2, contractSince: '2024-07-10', mrr: 0    },
];

const MOCK_VENDORS: Vendor[] = [
  { id: 'v1', name: 'Hubject',        type: 'eMSP + CPO', country: 'DE', ocpiVersion: '2.2.1', status: 'connected', endpoint: 'https://api.hubject.com/ocpi',         sessions: 12450 },
  { id: 'v2', name: 'Gireve',         type: 'eMSP + CPO', country: 'FR', ocpiVersion: '2.2',   status: 'connected', endpoint: 'https://ocpi.gireve.com',               sessions: 8920  },
  { id: 'v3', name: 'PlugSurfing',    type: 'eMSP',       country: 'DE', ocpiVersion: '2.1.1', status: 'connected', endpoint: 'https://api.plugsurfing.com/ocpi',      sessions: 3210  },
  { id: 'v4', name: 'Allego',         type: 'CPO',        country: 'NL', ocpiVersion: '2.2.1', status: 'pending',   endpoint: 'https://ocpi.allego.eu',                sessions: 0     },
  { id: 'v5', name: 'Total Energies', type: 'CPO',        country: 'FR', ocpiVersion: '2.2',   status: 'error',     endpoint: 'https://api.totalenergies.com/ocpi',    sessions: 0     },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-0041', client: 'EV Fleet Co',      period: 'May 2025', amount: 1400, status: 'pending', dueDate: '2025-06-01' },
  { id: 'INV-0040', client: 'GreenMobility SA', period: 'May 2025', amount: 299,  status: 'overdue', dueDate: '2025-05-15' },
  { id: 'INV-0039', client: 'Volta Networks',   period: 'May 2025', amount: 299,  status: 'pending', dueDate: '2025-06-01' },
  { id: 'INV-0038', client: 'PowerGrid LatAm',  period: 'May 2025', amount: 99,   status: 'pending', dueDate: '2025-06-01' },
  { id: 'INV-0037', client: 'EV Fleet Co',      period: 'Apr 2025', amount: 1400, status: 'paid',    dueDate: '2025-05-01' },
  { id: 'INV-0036', client: 'Volta Networks',   period: 'Apr 2025', amount: 299,  status: 'paid',    dueDate: '2025-05-01' },
  { id: 'INV-0035', client: 'PowerGrid LatAm',  period: 'Apr 2025', amount: 99,   status: 'paid',    dueDate: '2025-05-01' },
];

const MOCK_API_KEYS: ApiKeyEntry[] = [
  { id: 'k1', label: 'Production — Main',          keyPreview: 'cb_live_prod_a8f3…d92c', created: '2024-01-15', lastUsed: '2 hours ago',  permissions: ['sessions:read', 'cdrs:read', 'billing:write', 'vendors:read'], revealed: false },
  { id: 'k2', label: 'Staging',                    keyPreview: 'cb_test_stag_c3e1…b07a', created: '2024-06-01', lastUsed: '3 days ago',   permissions: ['sessions:read', 'cdrs:read'], revealed: false },
  { id: 'k3', label: 'Vendor Sync — Hubject',      keyPreview: 'cb_live_hub_f9a2…3441', created: '2024-09-10', lastUsed: '1 hour ago',   permissions: ['vendors:read', 'ocpi:write'], revealed: false },
];

// ── Theme tokens ──────────────────────────────────────────────────────────────
// Light + dark pairs. Avoids bg-white, bg-slate-50..200 and text-slate-400..900,
// which index.css force-overrides in dark mode.

const ring     = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';
const heading  = 'text-gray-900 dark:text-white';
const sub      = 'text-gray-600 dark:text-slate-400';
const muted    = 'text-gray-500 dark:text-slate-400';
const body     = 'text-gray-700 dark:text-slate-300';
const card     = 'rounded-2xl border border-gray-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/50';
const divider  = 'border-gray-200 dark:border-slate-800';
const zebra    = 'bg-gray-50/80 dark:bg-slate-900/30';
const theadCls = 'bg-gray-100/80 border-b border-gray-200 dark:bg-slate-900/80 dark:border-slate-800';
const thCls    = 'text-left text-[11px] font-semibold uppercase tracking-wide px-4 py-3 text-gray-500 dark:text-slate-400 whitespace-nowrap';
const inputCls = 'w-full rounded-xl border border-gray-300 bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition';
const labelCls = 'block text-xs font-medium mb-1 text-gray-700 dark:text-slate-300';
const primaryBtn = `inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors ${ring}`;
const secondaryBtn = `rounded-xl border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white py-2 text-sm transition-colors ${ring}`;
const iconBtn  = `inline-flex items-center justify-center rounded-md p-1 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors ${ring}`;
const textLink = `text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-white transition-colors rounded ${ring}`;

// ── Helper chips ──────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    connected: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    paid:      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    pending:   'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    error:     'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25',
    overdue:   'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25',
    suspended: 'bg-gray-500/10 text-gray-600 dark:text-slate-300 border-gray-500/25',
  };
  const icon: Record<string, React.ReactNode> = {
    active: <CheckCircle size={10} />, connected: <Wifi size={10} />, paid: <CheckCircle size={10} />,
    pending: <Clock size={10} />, error: <WifiOff size={10} />, overdue: <AlertTriangle size={10} />,
    suspended: <XCircle size={10} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize whitespace-nowrap ${map[status] ?? map.pending}`}>
      {icon[status]} {status}
    </span>
  );
}

function PlanChip({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    starter:    'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
    growth:     'bg-brand-600/15 text-brand-700 dark:bg-brand-600/20 dark:text-brand-400',
    enterprise: 'bg-violet-600/15 text-violet-700 dark:bg-violet-600/20 dark:text-violet-300',
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold capitalize ${map[plan] ?? ''}`}>
      {plan}
    </span>
  );
}

function ModalFrame({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-base font-semibold ${heading}`}>{title}</h2>
          <button onClick={onClose} aria-label="Close" className={iconBtn}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Add Client Modal ──────────────────────────────────────────────────────────

function AddClientModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (c: Client) => void;
}) {
  const [form, setForm] = useState({ company: '', contact: '', email: '', plan: 'growth' as Client['plan'] });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    onAdd({
      id: `c${Date.now()}`, ...form, status: 'pending',
      portalUsers: 0, contractSince: new Date().toISOString().slice(0, 10),
      mrr: form.plan === 'starter' ? 99 : form.plan === 'growth' ? 299 : 0,
    });
    onClose();
  }
  return (
    <ModalFrame title="Add client" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {([['company','Company name','Volta Networks'],['contact','Contact name','João Silva'],['email','Work email','joao@volta.io']] as [keyof typeof form, string, string][]).map(([k, label, ph]) => (
          <div key={k}>
            <label htmlFor={`add-client-${k}`} className={labelCls}>{label}</label>
            <input id={`add-client-${k}`} required type={k === 'email' ? 'email' : 'text'} placeholder={ph}
              value={form[k] as string} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              className={inputCls} />
          </div>
        ))}
        <fieldset>
          <legend className={labelCls}>Plan</legend>
          <div className="flex gap-2">
            {(['starter', 'growth', 'enterprise'] as Client['plan'][]).map(p => (
              <button key={p} type="button" aria-pressed={form.plan === p} onClick={() => setForm(f => ({ ...f, plan: p }))}
                className={`flex-1 rounded-xl border py-2 text-xs font-medium capitalize transition-colors ${ring} ${
                  form.plan === p
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500'
                }`}>{p}</button>
            ))}
          </div>
        </fieldset>
        <p className={`text-xs ${muted} pt-1`}>
          Portal login credentials will be emailed to the contact after confirmation.
        </p>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className={`flex-1 ${secondaryBtn}`}>Cancel</button>
          <button type="submit" className={`flex-1 ${primaryBtn}`}>Add client</button>
        </div>
      </form>
    </ModalFrame>
  );
}

// ── Add Vendor Modal ──────────────────────────────────────────────────────────

function AddVendorModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (v: Vendor) => void;
}) {
  const [form, setForm] = useState({ name: '', type: 'CPO', country: 'DE', ocpiVersion: '2.2.1', endpoint: '' });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    onAdd({ id: `v${Date.now()}`, ...form, status: 'pending', sessions: 0 });
    onClose();
  }
  const field = (k: keyof typeof form, label: string, ph: string, type = 'text') => (
    <div key={k}>
      <label htmlFor={`add-vendor-${k}`} className={labelCls}>{label}</label>
      <input id={`add-vendor-${k}`} required type={type} placeholder={ph}
        value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
        className={inputCls} />
    </div>
  );
  return (
    <ModalFrame title="Add vendor" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {field('name',     'Vendor name',     'Hubject')}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="add-vendor-type" className={labelCls}>Type</label>
            <select id="add-vendor-type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputCls}>
              {['CPO','eMSP','eMSP + CPO'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="add-vendor-ocpi" className={labelCls}>OCPI version</label>
            <select id="add-vendor-ocpi" value={form.ocpiVersion} onChange={e => setForm(f => ({ ...f, ocpiVersion: e.target.value }))} className={inputCls}>
              {['2.1.1','2.2','2.2.1'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
        {field('country',  'Country code',    'DE')}
        {field('endpoint', 'OCPI endpoint URL','https://api.vendor.com/ocpi', 'url')}
        <p className={`text-xs ${muted} pt-1`}>
          A connection test will run after adding. The vendor will be listed as "pending" until handshake completes.
        </p>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className={`flex-1 ${secondaryBtn}`}>Cancel</button>
          <button type="submit" className={`flex-1 ${primaryBtn}`}>Add vendor</button>
        </div>
      </form>
    </ModalFrame>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function OperatorDashboard() {
  const navigate = useNavigate();
  usePageTitle('Operator Console · RFConnector');
  const { darkMode, toggleTheme } = useTheme();

  const rawSession = sessionStorage.getItem(OPERATOR_SESSION_KEY);
  const session: OperatorSession | null = rawSession ? JSON.parse(rawSession) : null;

  const [activeNav,       setActiveNav]       = useState<NavId>('overview');
  const [clients,         setClients]         = useState<Client[]>(MOCK_CLIENTS);
  const [vendors,         setVendors]         = useState<Vendor[]>(MOCK_VENDORS);
  const [apiKeys,         setApiKeys]         = useState<ApiKeyEntry[]>(MOCK_API_KEYS);
  const [search,          setSearch]          = useState('');
  const [showAddClient,   setShowAddClient]   = useState(false);
  const [showAddVendor,   setShowAddVendor]   = useState(false);
  const [copiedId,        setCopiedId]        = useState<string | null>(null);

  function signOut() {
    sessionStorage.removeItem(OPERATOR_SESSION_KEY);
    navigate('/login', { replace: true });
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function toggleReveal(id: string) {
    setApiKeys(ks => ks.map(k => k.id === id ? { ...k, revealed: !k.revealed } : k));
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────

  const activeClients   = clients.filter(c => c.status === 'active').length;
  const totalMrr        = clients.filter(c => c.status === 'active').reduce((s, c) => s + c.mrr, 0);
  const connectedVendors = vendors.filter(v => v.status === 'connected').length;
  const totalSessions   = vendors.reduce((s, v) => s + v.sessions, 0);
  const outstanding     = MOCK_INVOICES.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const overdue         = MOCK_INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  const pageHeader = (title: string, subtitle: React.ReactNode, action?: React.ReactNode) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className={`text-xl font-bold mb-1 ${heading}`}>{title}</h1>
        <p className={`text-sm ${sub}`}>{subtitle}</p>
      </div>
      {action}
    </div>
  );

  // ── Sections ──────────────────────────────────────────────────────────────

  function renderOverview() {
    const kpis: { label: string; value: string | number; sub: string; icon: React.ElementType; color: string; iconBg: string; nav: typeof activeNav; trend?: string; trendUp?: boolean }[] = [
      { label: 'Active clients',    value: activeClients,                    sub: `${clients.length} total`,        icon: Building2,  color: 'text-brand-600 dark:text-brand-400',     iconBg: 'bg-brand-500/10',   nav: 'clients',  trend: '+2 this month',  trendUp: true  },
      { label: 'Monthly recurring', value: `$${totalMrr.toLocaleString()}`,  sub: 'from active contracts',          icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-500/10', nav: 'payments', trend: '+12% vs last mo', trendUp: true  },
      { label: 'Connected vendors', value: connectedVendors,                 sub: `${vendors.length} total`,        icon: Network,    color: 'text-violet-600 dark:text-violet-400',   iconBg: 'bg-violet-500/10',  nav: 'vendors',  trend: '1 error',         trendUp: false },
      { label: 'Total sessions',    value: totalSessions.toLocaleString(),   sub: 'across all vendors',             icon: Activity,   color: 'text-amber-600 dark:text-amber-400',     iconBg: 'bg-amber-500/10',   nav: 'vendors',  trend: '+8% vs last mo',  trendUp: true  },
    ];
    return (
      <div className="p-4 sm:p-6 space-y-6">
        {pageHeader('Overview', 'Platform health at a glance')}

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(({ label, value, sub: kpiSub, icon: Icon, color, iconBg, nav, trend, trendUp }) => (
            <button
              key={label}
              onClick={() => setActiveNav(nav)}
              className={`group ${card} p-4 text-left transition-all hover:border-gray-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/60 motion-safe:hover:-translate-y-0.5 hover:shadow-lg ${ring}`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs ${muted}`}>{label}</p>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
                  <Icon size={13} className={color} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${heading}`}>{value}</p>
              <p className={`text-xs ${muted} mt-0.5`}>{kpiSub}</p>
              <div className={`flex items-center justify-between mt-3 pt-2 border-t ${divider}`}>
                {trend && (
                  <span className={`text-[11px] font-medium ${trendUp ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                    {trendUp ? '↑' : '↓'} {trend}
                  </span>
                )}
                <span className={`text-[11px] ${muted} group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors ml-auto`}>
                  View →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Alerts */}
        {overdue > 0 && (
          <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3">
            <AlertTriangle size={14} className="text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">
              <span className="font-semibold">${overdue} overdue</span> — 1 invoice past due. Review in Payments.
            </p>
            <button onClick={() => setActiveNav('payments')} className={`ml-auto text-sm font-medium text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 shrink-0 rounded ${ring}`}>
              View →
            </button>
          </div>
        )}
        {outstanding > 0 && (
          <div role="status" className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3">
            <Clock size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <span className="font-semibold">${outstanding} outstanding</span> — {MOCK_INVOICES.filter(i => i.status === 'pending').length} invoices pending this cycle.
            </p>
          </div>
        )}
        {vendors.some(v => v.status === 'error') && (
          <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-orange-500/25 bg-orange-500/5 px-4 py-3">
            <WifiOff size={14} className="text-orange-600 dark:text-orange-400 shrink-0" />
            <p className="text-sm text-orange-800 dark:text-orange-300">
              <span className="font-semibold">{vendors.filter(v => v.status === 'error').length} vendor connection error</span> — check API credentials.
            </p>
            <button onClick={() => setActiveNav('vendors')} className={`ml-auto text-sm font-medium text-orange-700 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 shrink-0 rounded ${ring}`}>
              Fix →
            </button>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`${card} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-xs font-semibold uppercase tracking-wide ${sub}`}>Recent clients</h2>
              <button onClick={() => setActiveNav('clients')} className={`text-xs ${textLink}`}>View all →</button>
            </div>
            <ul className="space-y-2.5">
              {clients.slice(0, 4).map(c => (
                <li key={c.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${heading}`}>{c.company}</p>
                    <p className={`text-xs ${muted}`}>{c.contact}</p>
                  </div>
                  <StatusChip status={c.status} />
                </li>
              ))}
            </ul>
          </div>

          <div className={`${card} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-xs font-semibold uppercase tracking-wide ${sub}`}>Vendor connections</h2>
              <button onClick={() => setActiveNav('vendors')} className={`text-xs ${textLink}`}>View all →</button>
            </div>
            <ul className="space-y-2.5">
              {vendors.map(v => (
                <li key={v.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${heading}`}>{v.name}
                      <span className={`ml-2 text-[11px] ${muted}`}>{v.type}</span>
                    </p>
                    <p className={`text-xs ${muted} font-mono`}>{v.ocpiVersion}</p>
                  </div>
                  <StatusChip status={v.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  function renderClients() {
    const filtered = clients.filter(c =>
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div className="p-4 sm:p-6 space-y-5">
        {pageHeader('Clients', `${activeClients} active · ${clients.length} total`,
          <button onClick={() => setShowAddClient(true)} className={`${primaryBtn} self-start`}>
            <Plus size={14} /> Add client
          </button>
        )}

        <div className="relative max-w-xs">
          <label htmlFor="client-search" className="sr-only">Search clients</label>
          <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${muted}`} />
          <input id="client-search" type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            className={`${inputCls} pl-9 pr-4`} />
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={theadCls}>
                <tr>
                  {['Company','Contact','Plan','Portal users','MRR','Status'].map(h => (
                    <th key={h} scope="col" className={thCls}>{h}</th>
                  ))}
                  <th scope="col" className={thCls}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className={`border-b border-gray-100 dark:border-slate-800/60 last:border-0 ${i % 2 === 0 ? zebra : ''}`}>
                    <td className="px-4 py-3">
                      <p className={`font-medium ${heading}`}>{c.company}</p>
                      <p className={`text-xs ${muted} font-mono`}>{c.email}</p>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap ${body}`}>{c.contact}</td>
                    <td className="px-4 py-3"><PlanChip plan={c.plan} /></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 ${sub}`}>
                        <Users size={11} /> {c.portalUsers}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-mono ${body}`}>
                      {c.mrr > 0 ? `$${c.mrr}` : <span className={muted}>—</span>}
                    </td>
                    <td className="px-4 py-3"><StatusChip status={c.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <a href={`${CLIENT_BASE_URL}/login`} target="_blank" rel="noopener noreferrer"
                        aria-label={`Open client portal for ${c.company} (new tab)`}
                        className={`text-xs inline-flex items-center gap-1 ${textLink}`}>
                        Portal <ExternalLink size={10} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className={`py-10 text-center text-sm ${muted}`}>No clients match your search.</div>
          )}
        </div>
      </div>
    );
  }

  function renderVendors() {
    return (
      <div className="p-4 sm:p-6 space-y-5">
        {pageHeader('Vendors', `${connectedVendors} connected · vendors listed here appear in the client portal marketplace`,
          <button onClick={() => setShowAddVendor(true)} className={`${primaryBtn} self-start shrink-0`}>
            <Plus size={14} /> Add vendor
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vendors.map(v => (
            <div key={v.id} className={`${card} p-4 flex flex-col gap-3`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`font-semibold ${heading}`}>{v.name}</p>
                  <p className={`text-xs ${muted} mt-0.5`}>{v.type} · {v.country}</p>
                </div>
                <StatusChip status={v.status} />
              </div>

              <dl className="space-y-1.5">
                {[
                  ['Endpoint', v.endpoint, true],
                  ['OCPI', v.ocpiVersion, false],
                  ['Sessions', v.sessions.toLocaleString(), true],
                ].map(([label, value, mono]) => (
                  <div key={label as string} className="flex items-center gap-2">
                    <dt className={`text-[11px] ${muted} w-16 shrink-0`}>{label}</dt>
                    <dd className={`text-xs ${body} truncate ${mono ? 'font-mono' : ''}`}>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className={`flex items-center gap-2 pt-2 border-t ${divider}`}>
                {v.status === 'error' && (
                  <button className={`flex-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 transition-colors inline-flex items-center justify-center gap-1 ${ring}`}>
                    <RefreshCw size={11} /> Reconnect
                  </button>
                )}
                {v.status === 'pending' && (
                  <button className={`flex-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 transition-colors inline-flex items-center justify-center gap-1 ${ring}`}>
                    <RefreshCw size={11} /> Test connection
                  </button>
                )}
                {v.status === 'connected' && (
                  <button className={`flex-1 rounded-lg border border-gray-200 bg-gray-100/80 hover:bg-gray-200/80 dark:border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 py-1.5 text-xs font-medium ${body} transition-colors inline-flex items-center justify-center gap-1 ${ring}`}>
                    <RefreshCw size={11} /> Sync now
                  </button>
                )}
                <button aria-label={`Remove ${v.name}`} className={`rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 p-1.5 ${muted} hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/25 transition-colors ${ring}`}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 dark:border-slate-700 dark:bg-slate-900/30 p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Network size={14} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className={`text-sm font-medium ${heading}`}>Vendors drive the client portal</p>
            <p className={`text-sm ${sub} mt-0.5 leading-relaxed`}>
              Only vendors you add here appear in the client portal's Market Place and roaming sections.
              Clients can only contract with and see data from these vendors.
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderPayments() {
    const paidTotal = MOCK_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    return (
      <div className="p-4 sm:p-6 space-y-5">
        {pageHeader('Payments & Billing', 'Client invoices and revenue')}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Collected (all time)', value: `$${paidTotal.toLocaleString()}`, color: 'text-emerald-700 dark:text-emerald-400' },
            { label: 'Outstanding',           value: `$${outstanding}`,               color: 'text-amber-700 dark:text-amber-400'  },
            { label: 'Overdue',               value: `$${overdue}`,                   color: 'text-red-700 dark:text-red-400'    },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${card} p-4`}>
              <p className={`text-xs ${muted} mb-2`}>{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={theadCls}>
                <tr>
                  {['Invoice','Client','Period','Amount','Due date','Status'].map(h => (
                    <th key={h} scope="col" className={thCls}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((inv, i) => (
                  <tr key={inv.id} className={`border-b border-gray-100 dark:border-slate-800/60 last:border-0 ${i % 2 === 0 ? zebra : ''}`}>
                    <td className={`px-4 py-3 font-mono text-xs whitespace-nowrap ${sub}`}>{inv.id}</td>
                    <td className={`px-4 py-3 font-medium whitespace-nowrap ${heading}`}>{inv.client}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${sub}`}>{inv.period}</td>
                    <td className={`px-4 py-3 font-mono ${heading}`}>${inv.amount.toLocaleString()}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${sub}`}>{inv.dueDate}</td>
                    <td className="px-4 py-3"><StatusChip status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderApiKeys() {
    return (
      <div className="p-4 sm:p-6 space-y-5">
        {pageHeader('API Keys & Integrations', 'Manage programmatic access to the RFConnector API',
          <button className={`${primaryBtn} self-start shrink-0`}>
            <Plus size={14} /> Generate key
          </button>
        )}

        <div className="space-y-3">
          {apiKeys.map(k => (
            <div key={k.id} className={`${card} p-4`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-2">
                    <p className={`font-medium text-sm ${heading}`}>{k.label}</p>
                    <span className={`text-[11px] ${muted}`}>Created {k.created}</span>
                    <span className={`text-[11px] ${muted}`}>· Used {k.lastUsed}</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50/80 dark:border-transparent dark:bg-slate-800/60 px-3 py-1.5 max-w-sm">
                    <span className={`text-xs font-mono flex-1 truncate ${body}`}>
                      {k.revealed ? `cb_live_${k.id}_FULL_KEY_DEMO_VALUE` : k.keyPreview}
                    </span>
                    <button onClick={() => toggleReveal(k.id)} aria-label={k.revealed ? `Hide ${k.label} key` : `Show ${k.label} key`} className={`${iconBtn} shrink-0`}>
                      {k.revealed ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button onClick={() => copyText(k.keyPreview, k.id)} aria-label={copiedId === k.id ? 'Copied' : `Copy ${k.label} key`} className={`${iconBtn} shrink-0`}>
                      {copiedId === k.id ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {k.permissions.map(p => (
                      <span key={p} className={`rounded px-1.5 py-0.5 text-[11px] font-mono bg-gray-100 dark:bg-slate-800 ${sub}`}>{p}</span>
                    ))}
                  </div>
                </div>
                <button aria-label={`Delete ${k.label} key`} className={`${iconBtn} hover:!text-red-600 dark:hover:!text-red-400 shrink-0`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={`${card} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-semibold ${heading}`}>Webhook endpoints</h2>
            <button className={`text-xs inline-flex items-center gap-1 ${textLink}`}>
              <Plus size={11} /> Add endpoint
            </button>
          </div>
          <div className={`text-center py-6 text-sm ${muted}`}>
            No webhook endpoints configured.
          </div>
        </div>
      </div>
    );
  }

  // ── Nav items ──────────────────────────────────────────────────────────────

  const NAV: { id: NavId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview',    icon: LayoutDashboard },
    { id: 'clients',  label: 'Clients',     icon: Building2,  badge: clients.filter(c => c.status === 'pending').length || undefined },
    { id: 'vendors',  label: 'Vendors',     icon: Network,    badge: vendors.filter(v => v.status === 'error').length || undefined },
    { id: 'payments', label: 'Payments',    icon: CreditCard, badge: MOCK_INVOICES.filter(i => i.status === 'overdue').length || undefined },
    { id: 'apikeys',  label: 'API Keys',    icon: Key },
  ];

  const themeButton = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${muted} hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors ${ring}`}
    >
      {darkMode ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row">

      {/* Sidebar — becomes a top bar with scrollable tabs below md */}
      <aside className="z-20 w-full md:w-56 shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl md:h-screen md:sticky md:top-0">

        <div className="h-14 border-b border-gray-200 dark:border-slate-800/60 flex items-center px-4 gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
            <Zap size={13} className="text-white" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold leading-none ${heading}`}>RFConnector</p>
            <p className={`text-[10px] uppercase tracking-widest mt-0.5 ${muted}`}>Operator Console</p>
          </div>
          <div className="flex items-center gap-1 md:hidden">
            {themeButton}
            <button onClick={signOut} aria-label="Sign out" className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${muted} hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors ${ring}`}>
              <LogOut size={15} />
            </button>
          </div>
        </div>

        <nav aria-label="Operator sections" className="flex md:flex-col md:flex-1 gap-1 md:gap-0.5 p-2 md:p-3 overflow-x-auto md:overflow-y-auto scrollbar-none">
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setActiveNav(id)}
              aria-current={activeNav === id ? 'page' : undefined}
              className={`shrink-0 md:w-full flex items-center gap-2.5 md:gap-3 rounded-xl px-3 py-2 md:py-2.5 text-sm whitespace-nowrap transition-colors border ${ring} ${
                activeNav === id
                  ? 'bg-brand-500/10 text-brand-700 border-brand-500/30 dark:bg-brand-600/20 dark:text-brand-400 dark:border-brand-600/30'
                  : `border-transparent ${sub} hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-slate-800/60`
              }`}>
              <Icon size={14} />
              <span className="flex-1 text-left">{label}</span>
              {badge ? (
                <span className="rounded-full bg-red-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 flex items-center justify-center" aria-label={`${badge} needs attention`}>
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="hidden md:block p-3 border-t border-gray-200 dark:border-slate-800/60 space-y-1.5">
          <div className="flex items-center gap-1">
            <a href={CLIENT_BASE_URL} target="_blank" rel="noopener noreferrer"
              className={`flex-1 flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${sub} hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors ${ring}`}>
              <Globe size={12} /> Client Portal <ExternalLink size={10} className="ml-auto" />
            </a>
            {themeButton}
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100/80 dark:bg-slate-800/40">
            <div className="w-7 h-7 rounded-full bg-brand-500/15 border border-brand-500/25 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-brand-700 dark:text-brand-400">
                {session?.email?.[0]?.toUpperCase() ?? 'O'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium truncate ${body}`}>{session?.email ?? 'operator'}</p>
              <p className={`text-[11px] ${muted}`}>Operator</p>
            </div>
          </div>

          <button
            onClick={signOut}
            className={`w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/70 dark:border-slate-700/60 dark:bg-slate-800/40 px-3 py-2 text-xs font-medium ${sub} hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-600 dark:hover:text-red-400 transition-all ${ring}`}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        {activeNav === 'overview' && renderOverview()}
        {activeNav === 'clients'  && renderClients()}
        {activeNav === 'vendors'  && renderVendors()}
        {activeNav === 'payments' && renderPayments()}
        {activeNav === 'apikeys'  && renderApiKeys()}
      </main>

      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onAdd={c => setClients(cs => [c, ...cs])}
        />
      )}
      {showAddVendor && (
        <AddVendorModal
          onClose={() => setShowAddVendor(false)}
          onAdd={v => setVendors(vs => [v, ...vs])}
        />
      )}
    </div>
  );
}
