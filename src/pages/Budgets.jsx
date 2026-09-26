import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { fetchBudgetStatus } from '../lib/budget';
import { CATEGORIES, categoryInfo } from '../lib/categories';
import { Info } from '../lib/icons';
import { currentMonth, money } from '../lib/format';
import { useToast } from '../components/Toast';
import CategoryIcon from '../components/CategoryIcon';
import PageHeader from '../components/PageHeader';
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
  if (error) return <p className="card text-center text-bad-ink">{error}</p>;

  const row = (name) => {
    const info = categoryInfo(name);
    const spent = spentBy[name] || 0;
    const limit = num(limits[name]);
    const isFixed = fixed.includes(name);
    return (
      <li key={name} className="py-4 first:pt-1 last:pb-1">
        <div className="flex items-center gap-3">
          <CategoryIcon name={name} size="sm" />
          <div className="min-w-0 flex-1">
            <label htmlFor={`lim-${name}`} className="block truncate text-sm font-medium">{info.label}</label>
            <p className="text-xs text-muted">{spent > 0 || limit > 0 ? `Spent ${money(spent)} this month` : 'Nothing spent yet'}</p>
          </div>
          <MoneyInput id={`lim-${name}`} step="100" placeholder="No limit" className="w-32"
            value={limits[name] ?? ''} onChange={(v) => setLimits({ ...limits, [name]: v })} />
        </div>
        <div className="mt-2 flex items-center gap-3 pl-10">
          {limit > 0 && spent > 0 && (
            <ProgressBar thin className="flex-1" percent={spent / limit * 100} level={spent > limit ? 'over' : !isFixed && spent >= limit * threshold / 100 ? 'warning' : 'ok'} />
          )}
          <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted">
            <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--ink)]" checked={isFixed} onChange={() => toggleFixed(name)} />
            Fixed payment
          </label>
        </div>
      </li>
    );
  };

  const fixedNames = names.filter((n) => fixed.includes(n));
  const flexNames = names.filter((n) => !fixed.includes(n));

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <PageHeader title="Budgets" subtitle="Set monthly limits. You get a warning at the alert level and a red alert when you go over." />

      {params.get('welcome') && (
        <div className="rise flex gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
          <Info size={20} className="shrink-0 text-muted" />
          <p>Welcome. Enter your salary, savings and category limits, then press <b>Save budget</b>.</p>
        </div>
      )}

      <section className="card rise" style={{ '--i': 1 }}>
        <h2 className="text-base font-semibold tracking-tight">Your month</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="income" className="label">Monthly take-home salary</label>
            <MoneyInput id="income" step="1000" placeholder="e.g. 50000" value={income} onChange={setIncome} />
          </div>
          <div>
            <label htmlFor="savings" className="label">Savings each month</label>
            <MoneyInput id="savings" step="500" placeholder="e.g. 10000" value={savings} onChange={setSavings} />
          </div>
          <div>
            <label htmlFor="monthly" className="label">Overall monthly spending limit</label>
            <MoneyInput id="monthly" step="100" placeholder="Salary minus savings" value={monthly} onChange={setMonthly} />
            {num(income) > 0 && num(savings) > 0 && num(monthly) !== num(income) - num(savings) && (
              <button type="button" className="link mt-2 text-xs"
                onClick={() => setMonthly(String(num(income) - num(savings)))}>Use salary minus savings ({money(num(income) - num(savings))})</button>
            )}
          </div>
          <div>
            <label htmlFor="threshold" className="label flex justify-between">Warn me at <span className="amount text-ink">{threshold}%</span></label>
            <input id="threshold" type="range" min="50" max="100" step="5" className="mt-3 w-full accent-[var(--ink)]"
              value={threshold} onChange={(e) => setThreshold(e.target.value)} />
            <p className="mt-1 text-xs text-muted">of any limit</p>
          </div>
        </div>

        {num(income) > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
            <Split label="Fixed" value={money(fixedTotal)} />
            <Split label="Day-to-day" value={money(spendableTotal)} sub={`≈ ${money(spendableTotal * 7 / 30)} a week`} />
            <Split label="Savings" value={money(num(savings))} />
            <Split label="Unplanned" value={money(leftOver)} bad={leftOver < 0} />
          </dl>
        )}
      </section>

      <section className="card rise" style={{ '--i': 2 }}>
        <h2 className="text-base font-semibold tracking-tight">Day-to-day spending</h2>
        <p className="mt-1 text-sm text-muted">These limits add up to {money(spendableTotal)}. The dashboard tracks them week by week.</p>
        <ul className="mt-4 divide-y divide-line">{flexNames.map(row)}</ul>
      </section>

      <section className="card rise" style={{ '--i': 3 }}>
        <h2 className="text-base font-semibold tracking-tight">Fixed monthly payments</h2>
        <p className="mt-1 text-sm text-muted">{fixedNames.length ? `EMI, rent and other payments that go out every month: ${money(fixedTotal)}.` : 'Tick "Fixed payment" on a category to move it here.'}</p>
        {fixedNames.length > 0 && <ul className="mt-4 divide-y divide-line">{fixedNames.map(row)}</ul>}
      </section>

      <div className="sticky bottom-24 z-30 flex justify-end md:bottom-6">
        <button type="submit" className="btn btn-primary h-11 px-6 shadow-[0_10px_30px_rgba(26,26,25,0.18)]" disabled={saving}>
          {saving ? <><InlineSpinner /> Saving…</> : 'Save budget'}
        </button>
      </div>
    </form>
  );
}

function MoneyInput({ id, value, onChange, className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-faint">₹</span>
      <input id={id} type="number" min="0" inputMode="decimal" className="input amount pl-7 text-right sm:text-left"
        value={value} onChange={(e) => onChange(e.target.value)} {...props} />
    </div>
  );
}

function Split({ label, value, sub, bad }) {
  return (
    <div className="bg-surface p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`amount mt-1 font-semibold ${bad ? 'text-bad-ink' : ''}`}>{value}</dd>
      {sub && <dd className="mt-0.5 text-xs text-muted">{sub}</dd>}
    </div>
  );
}
