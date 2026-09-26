import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  ArcElement, BarController, BarElement, CategoryScale, Chart as ChartJS, DoughnutController, Legend, LinearScale,
  LineController, LineElement, PointElement, Tooltip,
} from 'chart.js';
import { api, errorMessage } from '../lib/api';
import { categoryInfo, expenseCategory } from '../lib/categories';
import { money, moneyShort } from '../lib/format';
import CategoryIcon from '../components/CategoryIcon';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';

// The monthly chart mixes a bar and a line dataset, so both controllers must be registered.
ChartJS.register(ArcElement, BarController, BarElement, CategoryScale, DoughnutController, LinearScale, LineController, LineElement, PointElement, Tooltip, Legend);
ChartJS.defaults.font.family = "'Geist', ui-sans-serif, system-ui, sans-serif";

const RANGES = [
  { key: '3', label: '3 months' },
  { key: '6', label: '6 months' },
  { key: '12', label: '12 months' },
];

/** Re-render when the theme class on <html> flips, so chart colours follow it. */
function useThemeChange() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const obs = new MutationObserver(() => setTick((n) => n + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
}

export default function Insights() {
  const [expenses, setExpenses] = useState(null);
  const [budget, setBudget] = useState(null);
  const [range, setRange] = useState('6');
  const [error, setError] = useState('');
  useThemeChange();

  useEffect(() => {
    Promise.all([api.get('/api/expense/summary'), api.get('/api/budget')])
      .then(([s, b]) => { setExpenses(s.data.expenses || []); setBudget(b.data); })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const data = useMemo(() => {
    if (!expenses) return null;
    const months = Number(range);
    const start = dayjs().startOf('month').subtract(months - 1, 'month');
    const inRange = expenses.filter((e) => e.date && !dayjs(e.date).isBefore(start));
    const monthKeys = Array.from({ length: months }, (_, i) => start.add(i, 'month').format('YYYY-MM'));
    const byMonth = Object.fromEntries(monthKeys.map((k) => [k, 0]));
    const byCat = {};
    inRange.forEach((e) => {
      byMonth[dayjs(e.date).format('YYYY-MM')] += e.amount;
      const c = expenseCategory(e);
      byCat[c] = (byCat[c] || 0) + e.amount;
    });
    const total = inRange.reduce((s, e) => s + e.amount, 0);
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const biggest = inRange.reduce((m, e) => (!m || e.amount > m.amount ? e : m), null);
    const monthsOver = budget?.monthlyLimit > 0 ? monthKeys.filter((k) => byMonth[k] > budget.monthlyLimit).length : null;
    return { monthKeys, byMonth, cats, total, biggest, avg: total / months, count: inRange.length, monthsOver };
  }, [expenses, range, budget]);

  if (error) return <p className="card text-center text-bad-ink">{error}</p>;
  if (!data) return <Spinner />;

  const css = getComputedStyle(document.documentElement);
  const token = (name) => css.getPropertyValue(name).trim();
  const ink = token('--ink');
  const tick = token('--muted');
  const grid = token('--line');
  const bad = token('--bad');
  const warn = token('--warn');
  const limit = budget?.monthlyLimit || 0;
  const top = data.cats[0];
  const tooltip = { backgroundColor: ink, titleColor: token('--canvas'), bodyColor: token('--canvas'), padding: 10, cornerRadius: 6, displayColors: false };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Insights" subtitle="Spending patterns over time.">
        <div className="inline-flex rounded-md border border-line bg-surface p-0.5" role="radiogroup" aria-label="Period">
          {RANGES.map((r) => (
            <button key={r.key} onClick={() => setRange(r.key)} role="radio" aria-checked={range === r.key}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${range === r.key ? 'bg-ink font-medium text-on-ink' : 'text-muted hover:text-ink'}`}>{r.label}</button>
          ))}
        </div>
      </PageHeader>

      <dl className="rise grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4" style={{ '--i': 1 }}>
        <Stat label="Total spent" value={money(data.total)} sub={`${data.count} expenses`} />
        <Stat label="Monthly average" value={money(data.avg)} sub={limit ? `Budget ${money(limit)}` : 'No budget set'} />
        <Stat label="Top category" value={top ? categoryInfo(top[0]).label : '—'} sub={top ? money(top[1]) : ''} icon={top ? top[0] : null} />
        <Stat label="Months over budget" value={data.monthsOver ?? '—'} sub={limit ? `of the last ${range}` : 'Set a budget to track'} tone={data.monthsOver ? 'bad' : ''} />
      </dl>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="card rise flex min-w-0 flex-col lg:col-span-3" style={{ '--i': 2 }}>
          <h2 className="mb-4 text-base font-semibold tracking-tight">Monthly spending</h2>
          <div className="relative h-72 lg:h-auto lg:min-h-72 lg:flex-1">
            <Bar
              data={{
                labels: data.monthKeys.map((k) => dayjs(`${k}-01`).format('MMM YY')),
                datasets: [
                  {
                    type: 'bar', label: 'Spent', data: data.monthKeys.map((k) => data.byMonth[k]), borderRadius: 4, maxBarThickness: 44,
                    backgroundColor: data.monthKeys.map((k) => (limit && data.byMonth[k] > limit ? bad : ink)),
                  },
                  ...(limit ? [{ type: 'line', label: 'Budget', data: data.monthKeys.map(() => limit), borderColor: warn, borderDash: [5, 4], pointRadius: 0, borderWidth: 1.5 }] : []),
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { align: 'end', labels: { color: tick, boxWidth: 10, boxHeight: 10, useBorderRadius: true, borderRadius: 2 } },
                  tooltip: { ...tooltip, callbacks: { label: (c) => `${c.dataset.label}: ${money(c.parsed.y)}` } },
                },
                scales: {
                  x: { grid: { display: false }, border: { display: false }, ticks: { color: tick } },
                  y: { grid: { color: grid }, border: { display: false }, ticks: { color: tick, callback: (v) => moneyShort(v) } },
                },
              }}
            />
          </div>
        </section>

        <section className="card rise min-w-0 lg:col-span-2" style={{ '--i': 3 }}>
          <h2 className="mb-4 text-base font-semibold tracking-tight">By category</h2>
          {data.cats.length === 0 ? <p className="py-10 text-center text-sm text-muted">No spending in this period.</p> : (
            <>
              <div className="relative mx-auto h-48 max-w-48">
                <Doughnut
                  data={{
                    labels: data.cats.map(([c]) => categoryInfo(c).label),
                    datasets: [{ data: data.cats.map(([, v]) => v), backgroundColor: data.cats.map(([c]) => categoryInfo(c).color), borderWidth: 2, borderColor: token('--surface') }],
                  }}
                  options={{ cutout: '72%', plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: (c) => `${c.label}: ${money(c.parsed)}` } } } }}
                />
                <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                  <p className="text-xs text-muted">Total</p>
                  <p className="amount text-lg font-semibold">{moneyShort(data.total)}</p>
                </div>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {data.cats.map(([c, v]) => (
                  <li key={c} className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: categoryInfo(c).color }} />
                    <span className="min-w-0 flex-1 truncate">{categoryInfo(c).label}</span>
                    <span className="amount w-10 text-right text-muted">{Math.round((v / data.total) * 100)}%</span>
                    <span className="amount w-24 text-right font-medium">{money(v)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {data.biggest && (
        <p className="rise text-sm text-muted" style={{ '--i': 4 }}>Biggest single expense: <span className="font-medium text-ink">{data.biggest.title}</span> for {money(data.biggest.amount)} on {dayjs(data.biggest.date).format('D MMM YYYY')}.</p>
      )}
    </div>
  );
}

function Stat({ label, value, sub, tone, icon }) {
  return (
    <div className="min-w-0 bg-surface p-5">
      <dt className="eyebrow">{label}</dt>
      <dd className={`mt-2 flex items-center gap-2 text-xl font-semibold ${tone === 'bad' ? 'text-bad-ink' : ''}`}>
        {icon && <CategoryIcon name={icon} size="sm" />}
        <span className="amount truncate">{value}</span>
      </dd>
      {sub && <dd className="mt-1 text-xs text-muted">{sub}</dd>}
    </div>
  );
}
