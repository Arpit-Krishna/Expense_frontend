import {
  ArrowsClockwise, ChartBar, DeviceMobile, DownloadSimple, EnvelopeSimple, House, Monitor, Moon, Plus, Receipt, SignOut, Sun, Target, UserCircle,
} from '../lib/icons';
import { canPromptInstall, isIos, isStandalone, onInstallChange, promptInstall } from '../lib/install';
import SyncStatus from './SyncStatus';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearToken } from '../lib/api';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/expenses', label: 'Expenses', end: true },
  { to: '/budgets', label: 'Budgets' },
  { to: '/insights', label: 'Insights' },
  { to: '/export', label: 'Export' },
];

const MOBILE_LINKS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/expenses', label: 'Expenses', icon: Receipt, end: true },
  { to: '/quick-add', label: 'Add', icon: Plus, primary: true },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/insights', label: 'Insights', icon: ChartBar },
];

const THEMES = [
  { key: 'system', label: 'System', icon: Monitor },
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
];

function readTheme() {
  try {
    const t = localStorage.getItem('theme');
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

/** Light, dark, or follow the device. The choice is stored under the same key index.html reads. */
function useTheme() {
  const [theme, setTheme] = useState(readTheme);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media?.matches);
      document.documentElement.classList.toggle('dark', Boolean(dark));
    };
    apply();
    try {
      if (theme === 'system') localStorage.removeItem('theme');
      else localStorage.setItem('theme', theme);
    } catch { /* storage can be blocked */ }
    if (theme !== 'system' || !media) return undefined;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  return [theme, setTheme];
}

const linkClass = ({ isActive }) =>
  `relative rounded-md px-3 py-1.5 text-sm transition-colors ${
    isActive ? 'bg-subtle font-medium text-ink' : 'text-muted hover:text-ink'
  }`;

function useInstallable() {
  const [can, setCan] = useState(canPromptInstall);
  useEffect(() => onInstallChange(() => setCan(canPromptInstall())), []);
  return can;
}

function AccountMenu({ theme, setTheme, onLogout }) {
  const [open, setOpen] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);
  const installable = useInstallable();
  const showIosHelp = !installable && isIos() && !isStandalone();
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="btn btn-ghost h-9 w-9 p-0" aria-label="Account and settings" aria-expanded={open} aria-haspopup="menu">
        <UserCircle size={22} />
      </button>
      {open && (
        <div role="menu" className="rise absolute right-0 z-50 mt-2 w-60 rounded-lg border border-line bg-surface p-1.5 shadow-[0_12px_40px_rgba(26,26,25,0.10)]">
          <Link to="/profile" role="menuitem" className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-subtle">
            <UserCircle size={17} className="text-muted" /> Profile
          </Link>
          <Link to="/recurring" role="menuitem" className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-subtle">
            <ArrowsClockwise size={17} className="text-muted" /> Recurring payments
          </Link>
          <Link to="/email-alerts" role="menuitem" className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-subtle">
            <EnvelopeSimple size={17} className="text-muted" /> Email alerts
          </Link>
          <Link to="/export" role="menuitem" className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-subtle md:hidden">
            <DownloadSimple size={17} className="text-muted" /> Export
          </Link>
          {(installable || showIosHelp) && (
            <button role="menuitem" onClick={() => (installable ? promptInstall().then(() => setOpen(false)) : setIosHelp(!iosHelp))}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-subtle">
              <DeviceMobile size={17} className="text-muted" /> Install app
            </button>
          )}
          {iosHelp && (
            <p className="mx-2.5 mb-1 rounded-md bg-subtle px-2.5 py-2 text-xs leading-relaxed text-ink-soft">
              In Safari, tap the Share button, then Add to Home Screen.
            </p>
          )}
          <div className="my-1.5 border-t border-line" />
          <p className="eyebrow px-2.5 pb-1.5 pt-1">Appearance</p>
          <div className="grid grid-cols-3 gap-1 px-1 pb-1" role="radiogroup" aria-label="Theme">
            {THEMES.map(({ key, label, icon }) => {
              const Icon = icon;
              return (
              <button key={key} role="radio" aria-checked={theme === key} onClick={() => setTheme(key)}
                className={`flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-xs transition-colors ${
                  theme === key ? 'border-ink bg-subtle text-ink' : 'border-transparent text-muted hover:bg-subtle hover:text-ink'}`}>
                <Icon size={16} />{label}
              </button>
              );
            })}
          </div>
          <div className="my-1.5 border-t border-line" />
          <button onClick={onLogout} role="menuitem" className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-bad-ink hover:bg-bad-soft">
            <SignOut size={17} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => window.scrollTo(0, 0), [pathname]);
  const [theme, setTheme] = useTheme();

  const logout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh pb-28 md:pb-16">
      <a href="#main" className="sr-only z-50 rounded-md bg-ink px-3 py-2 text-sm text-on-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-3">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
            <img src="/favicon.svg" alt="" className="h-7 w-7 dark:invert" />
            Expensify
          </NavLink>
          <nav className="ml-6 hidden items-center gap-0.5 md:flex" aria-label="Main">
            {LINKS.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>)}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <SyncStatus />
            <NavLink to="/expenses/new" className="btn btn-primary hidden h-9 sm:inline-flex">
              <Plus size={15} weight="bold" /> Add expense
            </NavLink>
            <AccountMenu theme={theme} setTheme={setTheme} onLogout={logout} />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_LINKS.map(({ to, label, icon, end, primary }) => {
            const Icon = icon;
            return (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] font-medium transition-colors ${isActive ? 'text-ink' : 'text-muted'}`}>
              {({ isActive }) => (
                <>
                  {primary ? (
                    <span className="grid h-[22px] w-10 place-items-center rounded-md bg-ink text-on-ink"><Icon size={15} weight="bold" /></span>
                  ) : (
                    <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                  )}
                  {label}
                </>
              )}
            </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
