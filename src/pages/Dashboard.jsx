import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { fetchBudgetStatus, LEVEL_STYLES } from '../lib/budget';
import { categoryInfo } from '../lib/categories';
import { currentMonth, money, monthLabel, monthRange } from '../lib/format';
import BudgetAlerts from '../components/BudgetAlerts';
import ExpenseRow from '../components/ExpenseRow';
import ProgressBar from '../components/ProgressBar';
import Spinner from '../components/Spinner';
import MonthPicker from './MonthPicker';

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([
      fetchBudgetStatus(month),
      api.get('/api/expense', { params: { ...monthRange(month), size: 6, sortBy: 'date', sortDir: 'desc' } }),
    ])
      .then(([s, list]) => {
        if (cancelled) return;
        setStatus(s);
        setRecent(list.data.expenses || []);
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [month, reload]);

  const hasLimit = status?.monthlyLimit > 0;
  const style = LEVEL_STYLES[status?.level] || LEVEL_STYLES.none;
  const isCurrent = month === currentMonth();
  const perDay = hasLimit && status.daysLeft > 0 && status.remaining > 0 ? status.remaining / status.daysLeft : 0;
  const fixed = status?.fixedCategories || [];
  const categories = [...(status?.categories || [])].sort((a, b) =>
    fixed.includes(a.category) - fixed.includes(b.category) || (b.limit > 0) - (a.limit > 0) || b.spent - a.spent);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm muted">Where your money went this month, against your limits.</p>
        </div>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {loading ? <Spinner label="Loading your month… (the server can take a moment to wake up)" /> : error ? (
        <div className="card text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button className="btn btn-secondary mt-3" onClick={() => setReload((n) => n + 1)}>Try again</button>
        </div>
      ) : (
        <>
          <BudgetAlerts status={status} />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card min-w-0 md:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm muted">Spent in {monthLabel(month)}</p>
                  <p className="mt-1 text-3xl font-bold tabular-nums">{money(status.spent)}</p>
                  {hasLimit && <p className="mt-1 text-sm muted">of {money(status.monthlyLimit)} budget</p>}
                </div>
                {hasLimit && <span className={`shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-800 ${style.text}`}>{style.label}</span>}
              </div>
              {hasLimit ? (
                <>
                  <ProgressBar className="mt-4" percent={status.percent} level={status.level} thresholdPercent={status.alertThreshold} />
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="muted">{status.remaining >= 0 ? 'Left' : 'Over by'}</p>
                      <p className={`font-semibold tabular-nums ${status.remaining < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>{money(Math.abs(status.remaining))}</p>
                    </div>
                    {isCurrent && !(status.spendableLimit > 0) && (
                      <div>
                        <p className="muted">Safe per day</p>
                        <p className="font-semibold tabular-nums">{money(perDay)}</p>
                      </div>
                    )}
                    {isCurrent && (
                      <div>
                        <p className="muted">Projected</p>
                        <p className={`font-semibold tabular-nums ${status.projectedSpend > status.monthlyLimit ? 'text-amber-600 dark:text-amber-400' : ''}`}>{money(status.projectedSpend)}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm dark:bg-indigo-500/10">
                  No monthly budget yet. <Link to="/budgets" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Set your limits</Link> to get overspending alerts.
                </div>
              )}
            </div>

            <div className="card flex flex-col justify-between gap-4">
              <div>
                <p className="text-sm muted">Quick actions</p>
                <div className="mt-3 grid gap-2">
                  <Link to="/expenses/new" className="btn btn-primary">+ Add expense</Link>
                  <Link to="/budgets" className="btn btn-secondary">Edit budgets</Link>
                  <Link to="/export" className="btn btn-secondary">Export report</Link>
                </div>
              </div>
              {isCurrent && <p className="text-xs muted">{status.daysLeft} day{status.daysLeft === 1 ? '' : 's'} left in the month.</p>}
            </div>
          </div>

          {(status.spendableLimit > 0 || status.monthlyIncome > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {status.spendableLimit > 0 && (
                <div className="card min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm muted">Day-to-day money</p>
                    <span className={`text-xs font-semibold ${LEVEL_STYLES[status.spendableLevel].text}`}>{LEVEL_STYLES[status.spendableLevel].label}</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    {money(status.spendableSpent)} <span className="text-base font-normal muted">of {money(status.spendableLimit)}</span>
                  </p>
                  <ProgressBar className="mt-3" percent={status.spendablePercent} level={status.spendableLevel} thresholdPercent={status.alertThreshold} />
                  <p className="mt-3 text-sm">
                    {status.spendableSpent > status.spendableLimit
                      ? <span className="text-red-600 dark:text-red-400">Over by {money(status.spendableSpent - status.spendableLimit)}. Slow down until next salary.</span>
                      : isCurrent
                        ? <>You can spend about <b>{money(status.weeklyAllowance)}</b> a week for the rest of the month.</>
                        : <>{money(status.spendableLimit - status.spendableSpent)} was left unspent.</>}
                  </p>
                  <p className="mt-1 text-xs muted">Food, transport, fun and other non-fixed categories. Fixed: {status.fixedCategories.join(', ') || 'none'}.</p>
                </div>
              )}
              {status.monthlyIncome > 0 && (
                <div className="card min-w-0">
                  <p className="text-sm muted">Savings this month</p>
                  <p className={`mt-1 text-2xl font-bold tabular-nums ${status.savedSoFar < status.savingsTarget ? 'text-red-600 dark:text-red-400' : ''}`}>
                    {money(Math.max(0, status.savedSoFar))} <span className="text-base font-normal muted">left of {money(status.monthlyIncome)} salary</span>
                  </p>
                  {status.savingsTarget > 0 && (
                    <>
                      <ProgressBar className="mt-3" percent={Math.min(100, (Math.max(0, status.savedSoFar) / status.savingsTarget) * 100)}
                        level={status.savedSoFar >= status.savingsTarget ? 'ok' : 'over'} />
                      <p className="mt-3 text-sm">
                        {status.savedSoFar >= status.savingsTarget
                          ? <>Your {money(status.savingsTarget)} savings target is safe, with {money(status.savedSoFar - status.savingsTarget)} to spare.</>
                          : <span className="text-red-600 dark:text-red-400">You have dipped {money(status.savingsTarget - status.savedSoFar)} into your {money(status.savingsTarget)} savings.</span>}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="card min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">By category</h2>
                <Link to="/budgets" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">Limits</Link>
              </div>
              {categories.length === 0 ? <p className="py-6 text-center text-sm muted">Nothing spent this month yet.</p> : (
                <ul className="space-y-4">
                  {categories.map((c) => {
                    const info = categoryInfo(c.category);
                    const s = LEVEL_STYLES[c.level];
                    return (
                      <li key={c.category}>
                        <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                          <span className="flex items-center gap-2 font-medium">{info.icon} {info.label}
                            {fixed.includes(c.category) && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide muted dark:bg-slate-800">Fixed</span>}
                          </span>
                          <span className="tabular-nums">
                            {money(c.spent)}{c.limit > 0 && <span className="muted"> / {money(c.limit)}</span>}
                          </span>
                        </div>
                        {c.limit > 0 ? <ProgressBar percent={c.percent} level={c.level} /> : <p className="text-xs muted">No limit set</p>}
                        {c.level === 'over' && <p className={`mt-1 text-xs ${s.text}`}>Over by {money(c.spent - c.limit)}</p>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="card min-w-0">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="font-semibold">Recent expenses</h2>
                <Link to={`/expenses?month=${month}`} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">See all</Link>
              </div>
              {recent.length === 0 ? (
                <div className="py-6 text-center text-sm muted">
                  No expenses in this month. <Link to="/expenses/new" className="text-indigo-600 hover:underline dark:text-indigo-400">Add one</Link>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recent.map((e) => <ExpenseRow key={e.id} expense={e} />)}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
