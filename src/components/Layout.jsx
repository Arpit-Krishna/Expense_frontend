import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from '../lib/api';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/expenses', label: 'Expenses', end: true },
  { to: '/budgets', label: 'Budgets' },
  { to: '/insights', label: 'Insights' },
  { to: '/export', label: 'Export' },
];

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);
  const toggle = () => {
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    setIsDark(!isDark);
  };
  return [isDark, toggle];
}

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`;

export default function Layout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isDark, toggleTheme] = useTheme();

  const logout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">₹</span>
            Expensify
          </NavLink>
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {LINKS.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>)}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/expenses/new" className="btn btn-primary hidden sm:inline-flex">+ Add expense</NavLink>
            <button onClick={toggleTheme} className="btn btn-ghost px-2.5" aria-label="Toggle dark mode" title="Toggle dark mode">
              {isDark ? '☀️' : '🌙'}
            </button>
            <div className="relative">
              <button onClick={() => setOpen(!open)} className="btn btn-ghost px-2.5" aria-label="Account menu" aria-expanded={open}>👤</button>
              {open && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900" onMouseLeave={() => setOpen(false)}>
                  <NavLink to="/profile" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Profile</NavLink>
                  <button onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800">Log out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95">
        {[
          { to: '/', label: 'Home', icon: '🏠', end: true },
          { to: '/expenses', label: 'Expenses', icon: '🧾', end: true },
          { to: '/expenses/new', label: 'Add', icon: '➕' },
          { to: '/budgets', label: 'Budgets', icon: '🎯' },
          { to: '/insights', label: 'Insights', icon: '📊' },
        ].map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-xs ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
            <span className="text-lg leading-none">{l.icon}</span>{l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
