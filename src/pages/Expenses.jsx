import { MagnifyingGlass, Plus, Receipt, X } from '../lib/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { CATEGORIES } from '../lib/categories';
import { money, monthRange } from '../lib/format';
import ExpenseRow from '../components/ExpenseRow';
import PageHeader from '../components/PageHeader';
import { ListSkeleton } from '../components/Spinner';

const PAGE_SIZE = 15;

export default function Expenses() {
  const [params, setParams] = useSearchParams();
  const initialRange = params.get('month') ? monthRange(params.get('month')) : { from: '', to: '' };
  const filters = {
    q: params.get('q') || '',
    category: params.get('category') || '',
    from: params.get('from') ?? initialRange.from,
    to: params.get('to') ?? initialRange.to,
    sort: params.get('sort') || 'date:desc',
    page: Number(params.get('page') || 0),
  };
  const [search, setSearch] = useState(filters.q);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const update = (changes) => {
    const next = { ...filters, page: 0, ...changes };
    const p = {};
    Object.entries(next).forEach(([k, v]) => {
      if (v !== '' && v !== null && !(k === 'page' && v === 0) && !(k === 'sort' && v === 'date:desc')) p[k] = String(v);
    });
    setParams(p, { replace: true });
  };

  // Debounce the search box.
  useEffect(() => {
    if (search === filters.q) return undefined;
    const t = setTimeout(() => update({ q: search }), 350);
    return () => clearTimeout(t);
  });

  const key = JSON.stringify(filters);
  useEffect(() => {
    let cancelled = false;
    const f = JSON.parse(key);
    const [sortBy, sortDir] = f.sort.split(':');
    setLoading(true);
    setError('');
    api.get('/api/expense', {
      params: {
        page: f.page, size: PAGE_SIZE, sortBy, sortDir,
        category: f.category || undefined, from: f.from || undefined, to: f.to || undefined, q: f.q || undefined,
      },
    })
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [key]);

  const filtered = filters.q || filters.category || filters.from || filters.to;
  const byDate = filters.sort.startsWith('date');
  const groups = data && byDate ? groupByDay(data.expenses) : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Expenses"
        subtitle={data ? `${data.totalItems} expense${data.totalItems === 1 ? '' : 's'} · ${money(data.totalAmount)} in total` : 'Everything you have logged.'}>
        <Link to="/expenses/new" className="btn btn-primary"><Plus size={15} weight="bold" /> Add expense</Link>
      </PageHeader>

      <div className="rise grid gap-3 rounded-xl border border-line bg-surface p-3 sm:grid-cols-2 lg:grid-cols-12" style={{ '--i': 1 }}>
        <div className="relative sm:col-span-2 lg:col-span-5">
          <MagnifyingGlass size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input className="input pl-9" placeholder="Search title or note" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search" />
        </div>
        <select className="input lg:col-span-4" value={filters.category} onChange={(e) => update({ category: e.target.value })} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.label || c.name}</option>)}
        </select>
        <select className="input lg:col-span-3" value={filters.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
          <option value="date:desc">Newest first</option>
          <option value="date:asc">Oldest first</option>
          <option value="amount:desc">Highest amount</option>
          <option value="amount:asc">Lowest amount</option>
          <option value="title:asc">Title A-Z</option>
        </select>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-12">
          <label className="text-sm text-muted" htmlFor="from">From</label>
          <input id="from" type="date" className="input w-auto min-w-0 flex-1 sm:flex-none" value={filters.from} max={filters.to || undefined} onChange={(e) => update({ from: e.target.value })} />
          <label className="text-sm text-muted" htmlFor="to">to</label>
          <input id="to" type="date" className="input w-auto min-w-0 flex-1 sm:flex-none" value={filters.to} min={filters.from || undefined} onChange={(e) => update({ to: e.target.value })} />
          {filtered && (
            <button className="btn btn-ghost ml-auto shrink-0" onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>
              <X size={14} weight="bold" /> Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="card rise" style={{ '--i': 2 }}>
        {loading && !data ? <ListSkeleton rows={8} /> : error ? (
          <p className="py-10 text-center text-bad-ink">{error}</p>
        ) : data.expenses.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-subtle text-muted"><Receipt size={24} /></span>
            <p className="mt-4 text-lg font-medium">{filtered ? 'No expenses match these filters' : 'No expenses yet'}</p>
            <p className="mt-1 text-sm text-muted">{filtered ? 'Try a wider date range or another category.' : 'Add your first one to start tracking.'}</p>
            {!filtered && <Link to="/expenses/new" className="btn btn-primary mt-5"><Plus size={15} weight="bold" /> Add expense</Link>}
          </div>
        ) : (
          <>
            <div className={`transition-opacity ${groups ? 'space-y-5' : ''} ${loading ? 'opacity-50' : ''}`}>
              {groups ? groups.map((g) => (
                <section key={g.key}>
                  <div className="flex items-baseline justify-between border-b border-line pb-2 pt-1">
                    <h2 className="eyebrow">{g.label}</h2>
                    <span className="amount text-xs text-muted">{money(g.total)}</span>
                  </div>
                  <ul className="divide-y divide-line">
                    {g.items.map((e) => <ExpenseRow key={e.id} expense={e} showDate={false} />)}
                  </ul>
                </section>
              )) : (
                <ul className="divide-y divide-line">
                  {data.expenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
                </ul>
              )}
            </div>
            {data.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm text-muted">Page {filters.page + 1} of {data.totalPages}</span>
                <div className="flex gap-2">
                  <button className="btn btn-secondary" disabled={filters.page === 0} onClick={() => update({ page: filters.page - 1 })}>Previous</button>
                  <button className="btn btn-secondary" disabled={filters.page + 1 >= data.totalPages} onClick={() => update({ page: filters.page + 1 })}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function dayLabel(d) {
  const day = dayjs(d);
  if (day.isSame(dayjs(), 'day')) return 'Today';
  if (day.isSame(dayjs().subtract(1, 'day'), 'day')) return 'Yesterday';
  return day.format(day.isSame(dayjs(), 'year') ? 'ddd, D MMM' : 'D MMM YYYY');
}

/** Consecutive expenses on the same day, with the day's total. */
function groupByDay(expenses) {
  const groups = [];
  for (const e of expenses) {
    const key = e.date ? dayjs(e.date).format('YYYY-MM-DD') : 'none';
    let g = groups[groups.length - 1];
    if (!g || g.key !== key) {
      g = { key, label: e.date ? dayLabel(e.date) : 'No date', items: [], total: 0 };
      groups.push(g);
    }
    g.items.push(e);
    g.total += e.amount;
  }
  return groups;
}
