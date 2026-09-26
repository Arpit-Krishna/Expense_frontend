import { ArrowRight, ArrowsClockwise, CheckCircle } from '../lib/icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { fetchBudgetStatus, LEVEL_STYLES } from '../lib/budget';
import { categoryInfo } from '../lib/categories';
import { currentMonth, money, monthLabel, monthRange } from '../lib/format';
import BudgetAlerts from '../components/BudgetAlerts';
import DueSoon from '../components/DueSoon';
import CategoryIcon from '../components/CategoryIcon';
import ExpenseRow from '../components/ExpenseRow';
import { useSyncedVersion } from '../lib/useOffline';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import MonthPicker from './MonthPicker';

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const synced = useSyncedVersion();

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
  }, [month, reload, synced]);

  const isCurrent = month === currentMonth();

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Dashboard" subtitle="Where your money went this month, against your limits.">
        <MonthPicker month={month} onChange={setMonth} />
      </PageHeader>

      {isCurrent && <DueSoon />}

      {loading ? <DashboardSkeleton /> : error ? (
        <div className="card flex flex-col items-center gap-4 py-12 text-center">
          <p className="max-w-md text-bad-ink">{error}</p>
          <button className="btn btn-secondary" onClick={() => setReload((n) => n + 1)}>
            <ArrowsClockwise size={15} /> Try again
          </button>
        </div>
      ) : (
        <DashboardBody status={status} recent={recent} month={month} isCurrent={isCurrent} />
      )}
    </div>
  );
}

function DashboardBody({ status, recent, month, isCurrent }) {
  const hasLimit = status.monthlyLimit > 0;
  const perDay = hasLimit && status.daysLeft > 0 && status.remaining > 0 ? status.remaining / status.daysLeft : 0;
  const fixed = status.fixedCategories || [];
  const byUse = (a, b) => (b.limit > 0) - (a.limit > 0) || b.spent - a.spent;
  const flexCats = (status.categories || []).filter((c) => !fixed.includes(c.category)).sort(byUse);
  const fixedCats = (status.categories || []).filter((c) => fixed.includes(c.category)).sort(byUse);
  const showSide = status.spendableLimit > 0 || status.monthlyIncome > 0;

  return (
    <>
      <BudgetAlerts status={status} />

      {/* Month total */}
      <section className="card rise min-w-0" style={{ '--i': 1 }}>
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-4">
              <p className="eyebrow">Spent in {monthLabel(month)}</p>
              {hasLimit && <StatusBadge level={status.level} />}
            </div>
            <p className="amount mt-3 text-5xl font-semibold leading-none sm:text-6xl">{money(status.spent)}</p>
            {hasLimit ? (
              <>
                <p className="mt-3 text-[15px] text-muted">of your <span className="amount text-ink">{money(status.monthlyLimit)}</span> monthly budget</p>
                <ProgressBar className="mt-6" percent={status.percent} level={status.level} thresholdPercent={status.alertThreshold} />
              </>
            ) : (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-subtle p-4 text-sm">
                <span>No monthly budget yet. Set limits to get overspending alerts.</span>
                <Link to="/budgets" className="btn btn-primary h-9">Set your limits</Link>
              </div>
            )}
          </div>
          {hasLimit && (
            <dl className="grid grid-cols-3 content-center gap-x-4 gap-y-6 border-t border-line pt-6 lg:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <Figure label={status.remaining >= 0 ? 'Left to spend' : 'Over by'} value={money(Math.abs(status.remaining))} tone={status.remaining < 0 ? 'bad' : ''} />
              {isCurrent && !(status.spendableLimit > 0) && <Figure label="Safe per day" value={money(perDay)} />}
              {isCurrent && <Figure label="Projected" value={money(status.projectedSpend)} tone={status.projectedSpend > status.monthlyLimit ? 'warn' : ''} />}
              {isCurrent && <Figure label="Days left" value={status.daysLeft} />}
            </dl>
          )}
        </div>
      </section>

      {showSide && (
        <div className="grid gap-4 md:grid-cols-2">
          {status.spendableLimit > 0 && (
            <section className="card rise min-w-0" style={{ '--i': 2 }}>
              <div className="flex items-start justify-between gap-2">
                <p className="eyebrow">Day-to-day money</p>
                <StatusBadge level={status.spendableLevel} />
              </div>
              <p className="amount mt-3 text-3xl font-semibold">{money(status.spendableSpent)}</p>
              <p className="mt-1 text-sm text-muted">of <span className="amount">{money(status.spendableLimit)}</span></p>
              <ProgressBar className="mt-4" percent={status.spendablePercent} level={status.spendableLevel} thresholdPercent={status.alertThreshold} />
              <p className="mt-4 text-sm leading-relaxed">
                {status.spendableSpent > status.spendableLimit
                  ? <span className="text-bad-ink">Over by {money(status.spendableSpent - status.spendableLimit)}. Slow down until next salary.</span>
                  : isCurrent
                    ? <>About <b className="amount font-semibold">{money(status.weeklyAllowance)}</b> a week for the rest of the month.</>
                    : <>{money(status.spendableLimit - status.spendableSpent)} was left unspent.</>}
              </p>
            </section>
          )}
          {status.monthlyIncome > 0 && (
            <section className="card rise min-w-0" style={{ '--i': 3 }}>
              <p className="eyebrow">Savings this month</p>
              <p className={`amount mt-3 text-3xl font-semibold ${status.savedSoFar < status.savingsTarget ? 'text-bad-ink' : ''}`}>
                {money(Math.max(0, status.savedSoFar))}
              </p>
              <p className="mt-1 text-sm text-muted">left of <span className="amount">{money(status.monthlyIncome)}</span> salary</p>
              {status.savingsTarget > 0 && (
                <>
                  <ProgressBar className="mt-4" percent={Math.min(100, (Math.max(0, status.savedSoFar) / status.savingsTarget) * 100)}
                    level={status.savedSoFar >= status.savingsTarget ? 'ok' : 'over'} />
                  <p className="mt-4 text-sm leading-relaxed">
                    {status.savedSoFar >= status.savingsTarget
                      ? <>Your {money(status.savingsTarget)} target is safe, with {money(status.savedSoFar - status.savingsTarget)} to spare.</>
                      : <span className="text-bad-ink">You have dipped {money(status.savingsTarget - status.savedSoFar)} into your {money(status.savingsTarget)} savings.</span>}
                  </p>
                </>
              )}
            </section>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card rise min-w-0" style={{ '--i': 4 }}>
          <SectionHead title="By category" to="/budgets" action="Edit limits" />
          {flexCats.length + fixedCats.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Nothing spent this month yet.</p>
          ) : (
            <>
              {flexCats.length > 0 && (
                <ul className="space-y-4">{flexCats.map((c) => <FlexCategory key={c.category} c={c} />)}</ul>
              )}
              {fixedCats.length > 0 && (
                <>
                  <p className="eyebrow mb-2 mt-7 border-t border-line pt-5">Fixed payments</p>
                  <ul className="divide-y divide-line">{fixedCats.map((c) => <FixedCategory key={c.category} c={c} />)}</ul>
                </>
              )}
            </>
          )}
        </section>

        <section className="card rise min-w-0" style={{ '--i': 5 }}>
          <SectionHead title="Recent expenses" to={`/expenses?month=${month}`} action="See all" />
          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted">
              No expenses in this month.
              <Link to="/expenses/new" className="btn btn-secondary">Add one</Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((e) => <ExpenseRow key={e.id} expense={e} />)}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Figure({ label, value, tone }) {
  const color = tone === 'bad' ? 'text-bad-ink' : tone === 'warn' ? 'text-warn-ink' : '';
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`amount mt-1 text-base font-semibold sm:text-xl ${color}`}>{value}</dd>
    </div>
  );
}

function SectionHead({ title, to, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <Link to={to} className="group inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink">
        {action} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function FlexCategory({ c }) {
  const info = categoryInfo(c.category);
  const s = LEVEL_STYLES[c.level];
  return (
    <li className="flex items-center gap-3">
      <CategoryIcon name={c.category} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
          <span className="truncate font-medium">{info.label}</span>
          <span className="amount shrink-0">
            {money(c.spent)}{c.limit > 0 && <span className="text-muted"> / {money(c.limit)}</span>}
          </span>
        </div>
        {c.limit > 0 ? <ProgressBar thin percent={c.percent} level={c.level} /> : <p className="text-xs text-faint">No limit set</p>}
        {c.level === 'over' && <p className={`mt-1 text-xs ${s.text}`}>Over by {money(c.spent - c.limit)}</p>}
      </div>
    </li>
  );
}

function FixedCategory({ c }) {
  const info = categoryInfo(c.category);
  const paid = c.limit > 0 && c.spent >= c.limit;
  return (
    <li className="flex items-center gap-3 py-2.5 text-sm">
      <CategoryIcon name={c.category} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{info.label}</p>
        <p className="text-xs">
          {c.level === 'over' ? <span className="text-bad-ink">{money(c.spent - c.limit)} more than planned</span>
            : paid ? <span className="inline-flex items-center gap-1 text-ok-ink"><CheckCircle size={13} weight="fill" />Paid</span>
              : c.limit > 0 ? <span className="text-muted">{money(c.limit - c.spent)} still due</span> : <span className="text-faint">No amount set</span>}
        </p>
      </div>
      <span className="amount shrink-0">{money(c.spent)}{c.limit > 0 && !paid && <span className="text-muted"> / {money(c.limit)}</span>}</span>
    </li>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <p className="sr-only">Loading your month</p>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card space-y-5 lg:col-span-2">
          <div className="skeleton h-3 w-40" />
          <div className="skeleton h-14 w-72" />
          <div className="skeleton h-2 w-full" />
          <div className="grid grid-cols-3 gap-4 pt-4">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-10" />)}</div>
        </div>
        <div className="card space-y-4"><div className="skeleton h-3 w-32" /><div className="skeleton h-8 w-40" /><div className="skeleton h-2 w-full" /><div className="skeleton h-3 w-3/4" /></div>
      </div>
      <p className="text-center text-xs text-faint">The server can take a moment to wake up on the first visit.</p>
    </div>
  );
}
