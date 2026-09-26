import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip,
} from 'chart.js';
import { api, errorMessage } from '../lib/api';
import { categoryInfo, expenseCategory } from '../lib/categories';
import { money, moneyShort } from '../lib/format';
import Spinner from '../components/Spinner';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const RANGES = [
  { key: '3', label: '3 months' },
  { key: '6', label: '6 months' },
  { key: '12', label: '12 months' },
];

export default function Insights() {
  const [expenses, setExpenses] = useState(null);
  const [budget, setBudget] = useState(null);
  const [range, setRange] = useState('6');
  const [error, setError] = useState('');
  const isDark = document.documentElement.classList.contains('dark');

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

  if (error) return <p className="card text-center text-red-600 dark:text-red-400">{error}</p>;
  if (!data) return <Spinner />;

  const grid = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.15)';
  const tick = isDark ? '#94a3b8' : '#64748b';
  const limit = budget?.monthlyLimit || 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-sm muted">Spending patterns over time.</p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {RANGES.map((r) => (
            <button key={r.key} onClick={() => setRange(r.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${range === r.key ? 'bg-indigo-600 text-white' : 'muted hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{r.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total spent" value={money(data.total)} sub={`${data.count} expenses`} />
        <Stat label="Monthly average" value={money(data.avg)} sub={limit ? `Budget ${money(limit)}` : 'No budget set'} />
        <Stat label="Top category" value={data.cats[0] ? `${categoryInfo(data.cats[0][0]).icon} ${data.cats[0][0]}` : '—'} sub={data.cats[0] ? money(data.cats[0][1]) : ''} />
        <Stat label="Months over budget" value={data.monthsOver ?? '—'} sub={limit ? `of ${range}` : 'Set a budget to track'} tone={data.monthsOver ? 'bad' : ''} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="card lg:col-span-3">
          <h2 className="mb-3 font-semibold">Monthly spending</h2>
          <div className="h-72">
            <Bar
              data={{
                labels: data.monthKeys.map((k) => dayjs(`${k}-01`).format('MMM YY')),
                datasets: [
                  {
                    type: 'bar', label: 'Spent', data: data.monthKeys.map((k) => data.byMonth[k]), borderRadius: 6,
                    backgroundColor: data.monthKeys.map((k) => (limit && data.byMonth[k] > limit ? '#ef4444' : '#6366f1')),
                  },
                  ...(limit ? [{ type: 'line', label: 'Budget', data: data.monthKeys.map(() => limit), borderColor: '#f59e0b', borderDash: [6, 4], pointRadius: 0, borderWidth: 2 }] : []),
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: tick } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${money(c.parsed.y)}` } } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: tick } },
                  y: { grid: { color: grid }, ticks: { color: tick, callback: (v) => moneyShort(v) } },
                },
              }}
            />
          </div>
        </section>

        <section className="card lg:col-span-2">
          <h2 className="mb-3 font-semibold">By category</h2>
          {data.cats.length === 0 ? <p className="py-10 text-center text-sm muted">No spending in this period.</p> : (
            <>
              <div className="mx-auto h-52 max-w-52">
                <Doughnut
                  data={{
                    labels: data.cats.map(([c]) => c),
                    datasets: [{ data: data.cats.map(([, v]) => v), backgroundColor: data.cats.map(([c]) => categoryInfo(c).color), borderWidth: 0 }],
                  }}
                  options={{ cutout: '65%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.label}: ${money(c.parsed)}` } } } }}
                />
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {data.cats.map(([c, v]) => (
                  <li key={c} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryInfo(c).color }} />
                    <span className="flex-1">{c}</span>
                    <span className="muted">{Math.round((v / data.total) * 100)}%</span>
                    <span className="w-24 text-right font-medium tabular-nums">{money(v)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {data.biggest && (
        <p className="text-sm muted">Biggest single expense: <span className="font-medium text-slate-900 dark:text-slate-100">{data.biggest.title}</span> for {money(data.biggest.amount)} on {dayjs(data.biggest.date).format('D MMM YYYY')}.</p>
      )}
    </div>
  );
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide muted">{label}</p>
      <p className={`mt-1 truncate text-xl font-bold tabular-nums ${tone === 'bad' ? 'text-red-600 dark:text-red-400' : ''}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs muted">{sub}</p>}
    </div>
  );
}
