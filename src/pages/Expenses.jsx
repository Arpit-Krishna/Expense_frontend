import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { CATEGORIES } from '../lib/categories';
import { money, monthRange } from '../lib/format';
import ExpenseRow from '../components/ExpenseRow';
import Spinner from '../components/Spinner';

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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          {data && <p className="text-sm muted">{data.totalItems} expense{data.totalItems === 1 ? '' : 's'} · {money(data.totalAmount)} total</p>}
        </div>
        <Link to="/expenses/new" className="btn btn-primary">+ Add expense</Link>
      </div>

      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input className="input lg:col-span-2" placeholder="Search title or note…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search" />
        <select className="input" value={filters.category} onChange={(e) => update({ category: e.target.value })} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.label || c.name}</option>)}
        </select>
        <select className="input" value={filters.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
          <option value="date:desc">Newest first</option>
          <option value="date:asc">Oldest first</option>
          <option value="amount:desc">Highest amount</option>
          <option value="amount:asc">Lowest amount</option>
          <option value="title:asc">Title A-Z</option>
        </select>
        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-5">
          <label className="text-sm muted" htmlFor="from">From</label>
          <input id="from" type="date" className="input" value={filters.from} max={filters.to || undefined} onChange={(e) => update({ from: e.target.value })} />
          <label className="text-sm muted" htmlFor="to">to</label>
          <input id="to" type="date" className="input" value={filters.to} min={filters.from || undefined} onChange={(e) => update({ to: e.target.value })} />
          {filtered && <button className="btn btn-ghost shrink-0" onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>Clear</button>}
        </div>
      </div>

      <div className="card">
        {loading && !data ? <Spinner /> : error ? (
          <p className="py-8 text-center text-red-600 dark:text-red-400">{error}</p>
        ) : data.expenses.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-lg font-medium">{filtered ? 'No expenses match these filters' : 'No expenses yet'}</p>
            <p className="mt-1 text-sm muted">{filtered ? 'Try a wider date range or another category.' : 'Add your first one to start tracking.'}</p>
            {!filtered && <Link to="/expenses/new" className="btn btn-primary mt-4">+ Add expense</Link>}
          </div>
        ) : (
          <>
            <ul className={`divide-y divide-slate-100 dark:divide-slate-800 ${loading ? 'opacity-50' : ''}`}>
              {data.expenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
            </ul>
            {data.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-sm muted">Page {filters.page + 1} of {data.totalPages}</span>
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
