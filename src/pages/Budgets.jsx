import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { fetchBudgetStatus } from '../lib/budget';
import { CATEGORIES, categoryInfo } from '../lib/categories';
import { currentMonth, money } from '../lib/format';
import { SALARY_PLAN } from '../lib/presets';
import { useToast } from '../components/Toast';
import ProgressBar from '../components/ProgressBar';
import Spinner, { InlineSpinner } from '../components/Spinner';

const num = (v) => Number(v) || 0;
const str = (v) => (v ? String(v) : '');

export default function Budgets() {
  const toast = useToast();
  const [params] = useSearchParams();
  const [income, setIncome] = useState('');
  const [savings, setSavings] = useState('');
  const [monthly, setMonthly] = useState('');
  const [threshold, setThreshold] = useState(80);
  const [limits, setLimits] = useState({});
  const [fixed, setFixed] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const apply = (b) => {
    setIncome(str(b.monthlyIncome));
    setSavings(str(b.savingsTarget));
    setMonthly(str(b.monthlyLimit));
    setThreshold(b.alertThreshold || 80);
    setLimits(Object.fromEntries(Object.entries(b.categoryLimits || {}).map(([k, v]) => [k, String(v)])));
    setFixed(b.fixedCategories || []);
  };

  const load = () => Promise.all([api.get('/api/budget'), fetchBudgetStatus(currentMonth())])
    .then(([b, s]) => { apply(b.data); setStatus(s); });

  useEffect(() => {
    load().catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
    // Runs once on mount; load only uses state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const names = [...new Set([...CATEGORIES.map((c) => c.name), ...Object.keys(limits)])];
  const spentBy = Object.fromEntries((status?.categories || []).map((c) => [c.category, c.spent]));
  const fixedTotal = names.filter((n) => fixed.includes(n)).reduce((s, n) => s + num(limits[n]), 0);
  const spendableTotal = names.filter((n) => !fixed.includes(n)).reduce((s, n) => s + num(limits[n]), 0);
  const leftOver = num(income) - fixedTotal - spendableTotal - num(savings);

  const toggleFixed = (name) => setFixed(fixed.includes(name) ? fixed.filter((f) => f !== name) : [...fixed, name]);

  const loadPlan = () => {
    apply(SALARY_PLAN);
    toast('Salary plan loaded. Press Save budget to keep it.', 'info', 6000);
  };

  const save = async (e) => {
    e.preventDefault();
    const bad = [income, savings, monthly, ...Object.values(limits)].some((v) => v !== '' && (Number.isNaN(Number(v)) || Number(v) < 0));
    if (bad) { toast('Amounts must be positive numbers.', 'error'); return; }
    setSaving(true);
    try {
      const categoryLimits = Object.fromEntries(Object.entries(limits).filter(([, v]) => num(v) > 0).map(([k, v]) => [k, num(v)]));
      await api.put('/api/budget', {
        monthlyIncome: num(income),
        savingsTarget: num(savings),
        monthlyLimit: num(monthly),
        alertThreshold: Number(threshold),
        categoryLimits,
        fixedCategories: fixed.filter((f) => categoryLimits[f]),
      });
      await load();
      toast('Budget saved', 'success');
    } catch (err) {
      toast(errorMessage(err, 'Could not save your budget.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="card text-center text-red-600 dark:text-red-400">{error}</p>;

  const row = (name) => {
    const info = categoryInfo(name);
    const spent = spentBy[name] || 0;
    const limit = num(limits[name]);
    const isFixed = fixed.includes(name);
    return (
      <li key={name} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xl">{info.icon}</span>
          <label htmlFor={`lim-${name}`} className="min-w-0 flex-1 truncate text-sm font-medium">{info.label}</label>
          <input id={`lim-${name}`} type="number" min="0" step="100" inputMode="decimal" placeholder="No limit" className="input w-28 text-right"
            value={limits[name] ?? ''} onChange={(e) => setLimits({ ...limits, [name]: e.target.value })} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 text-xs muted">
            <input type="checkbox" className="h-3.5 w-3.5 accent-indigo-600" checked={isFixed} onChange={() => toggleFixed(name)} />
            Fixed monthly payment
          </label>
          {(spent > 0 || limit > 0) && <span className="text-xs muted">Spent {money(spent)}</span>}
        </div>
        {limit > 0 && spent > 0 && (
          <ProgressBar className="mt-2" percent={spent / limit * 100} level={spent > limit ? 'over' : !isFixed && spent >= limit * threshold / 100 ? 'warning' : 'ok'} />
        )}
      </li>
    );
  };

  const fixedNames = names.filter((n) => fixed.includes(n));
  const flexNames = names.filter((n) => !fixed.includes(n));

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-sm muted">Set monthly limits. You get a warning at the alert level and a red alert when you go over.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={loadPlan}>Load my salary plan</button>
      </div>

      {params.get('welcome') && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm dark:border-indigo-900 dark:bg-indigo-500/10">
          Welcome! Press <b>Load my salary plan</b> to fill in your limits, check them, then press <b>Save budget</b>.
        </div>
      )}

      <section className="card grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="income" className="label">Monthly take-home salary (₹)</label>
          <input id="income" type="number" min="0" step="1000" inputMode="decimal" placeholder="e.g. 66000" className="input"
            value={income} onChange={(e) => setIncome(e.target.value)} />
        </div>
        <div>
          <label htmlFor="savings" className="label">Savings each month (₹)</label>
          <input id="savings" type="number" min="0" step="500" inputMode="decimal" placeholder="e.g. 9500" className="input"
            value={savings} onChange={(e) => setSavings(e.target.value)} />
        </div>
        <div>
          <label htmlFor="monthly" className="label">Overall monthly spending limit (₹)</label>
          <input id="monthly" type="number" min="0" step="100" inputMode="decimal" placeholder="Salary minus savings" className="input"
            value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          {num(income) > 0 && num(savings) > 0 && num(monthly) !== num(income) - num(savings) && (
            <button type="button" className="mt-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
              onClick={() => setMonthly(String(num(income) - num(savings)))}>Use salary minus savings ({money(num(income) - num(savings))})</button>
          )}
        </div>
        <div>
          <label htmlFor="threshold" className="label">Warn me at {threshold}% of a limit</label>
          <input id="threshold" type="range" min="50" max="100" step="5" className="mt-3 w-full accent-indigo-600"
            value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </div>

        {num(income) > 0 && (
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:col-span-2 sm:grid-cols-4 dark:bg-slate-800/60">
            <div><p className="muted">Fixed</p><p className="font-semibold tabular-nums">{money(fixedTotal)}</p></div>
            <div><p className="muted">Day-to-day</p><p className="font-semibold tabular-nums">{money(spendableTotal)}</p><p className="text-xs muted">≈ {money(spendableTotal * 7 / 30)} a week</p></div>
            <div><p className="muted">Savings</p><p className="font-semibold tabular-nums">{money(num(savings))}</p></div>
            <div><p className="muted">Unplanned</p><p className={`font-semibold tabular-nums ${leftOver < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>{money(leftOver)}</p></div>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="font-semibold">Day-to-day spending</h2>
        <p className="mb-4 text-sm muted">These limits add up to {money(spendableTotal)}. The dashboard tracks them week by week.</p>
        <ul className="grid gap-3 sm:grid-cols-2">{flexNames.map(row)}</ul>
      </section>

      <section className="card">
        <h2 className="font-semibold">Fixed monthly payments</h2>
        <p className="mb-4 text-sm muted">{fixedNames.length ? `EMI, rent and other payments that go out every month: ${money(fixedTotal)}.` : 'Tick "Fixed monthly payment" on a category to move it here.'}</p>
        {fixedNames.length > 0 && <ul className="grid gap-3 sm:grid-cols-2">{fixedNames.map(row)}</ul>}
      </section>

      <div className="sticky bottom-20 flex justify-end md:bottom-4">
        <button type="submit" className="btn btn-primary shadow-lg" disabled={saving}>{saving ? <><InlineSpinner /> Saving…</> : 'Save budget'}</button>
      </div>
    </form>
  );
}
