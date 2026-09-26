import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { fetchBudgetStatus, newAlerts } from '../lib/budget';
import { CATEGORIES, categoryInfo, expenseCategory } from '../lib/categories';
import { money, toApiDateTime, today } from '../lib/format';
import { Backspace, CloudSlash, PencilSimpleLine } from '../lib/icons';
import { createExpense, recentCategories } from '../lib/offline';
import CategoryIcon from '../components/CategoryIcon';
import { useOnline, usePending } from '../lib/useOffline';
import { InlineSpinner } from '../components/Spinner';
import { useToast } from '../components/Toast';

const DEFAULT_RECENTS = ['Food', 'Transport', 'Personal & Fun', 'Other'];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

/** Appends one keypad press to the amount string: at most 7 digits before the point and 2 after. */
function press(amount, key) {
  if (key === 'back') return amount.slice(0, -1);
  if (key === '.') return amount.includes('.') ? amount : `${amount || '0'}.`;
  const [whole, frac] = amount.split('.');
  if (frac !== undefined) return frac.length >= 2 ? amount : amount + key;
  if (whole === '0') return key;
  return whole.length >= 7 ? amount : amount + key;
}

const shown = (amount) => {
  if (!amount) return '0';
  const [whole, frac] = amount.split('.');
  const grouped = Number(whole || 0).toLocaleString('en-IN');
  return frac !== undefined ? `${grouped}.${frac}` : grouped;
};

export default function QuickAdd() {
  const toast = useToast();
  const online = useOnline();
  const pending = usePending();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('today');
  const [showAll, setShowAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recents, setRecents] = useState(() => recentCategories());

  // Fill recents from the latest expenses the first time, when this device has none yet.
  useEffect(() => {
    if (recents.length || !online) return;
    api.get('/api/expense', { params: { size: 20, sortBy: 'date', sortDir: 'desc' } })
      .then((res) => setRecents([...new Set((res.data.expenses || []).map(expenseCategory))].slice(0, 6)))
      .catch(() => {});
  }, [recents.length, online]);

  const chips = useMemo(() => {
    const list = [...new Set([...recents, ...DEFAULT_RECENTS])].slice(0, 6);
    return category && !list.includes(category) ? [category, ...list.slice(0, 5)] : list;
  }, [recents, category]);

  const value = Number(amount || 0);
  const canSave = value > 0 && category && !saving;

  const save = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    const date = day === 'today' ? today() : dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const payload = {
      title: title.trim() || categoryInfo(category).label,
      amount: Math.round(value * 100) / 100,
      category,
      description: null,
      date: toApiDateTime(date),
    };
    try {
      const month = date.slice(0, 7);
      const before = online ? await fetchBudgetStatus(month).catch(() => null) : null;
      const result = await createExpense(payload);
      if (result.queued) {
        toast(`${money(payload.amount)} saved on this device. It will sync when you are back online.`, 'warning', 6000);
      } else {
        toast(`${money(payload.amount)} added to ${categoryInfo(category).label}`, 'success');
        const after = await fetchBudgetStatus(month).catch(() => null);
        newAlerts(before, after).forEach((a) => toast(a.text, a.level === 'over' ? 'error' : 'warning', 8000));
      }
      setRecents(recentCategories());
      setAmount('');
      setTitle('');
    } catch (err) {
      toast(errorMessage(err, 'Could not save the expense.'), 'error');
    } finally {
      setSaving(false);
    }
  }, [canSave, day, title, category, value, online, toast]);

  // A hardware keyboard works too.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9.]$/.test(e.key)) setAmount((a) => press(a, e.key));
      else if (e.key === 'Backspace') setAmount((a) => press(a, 'back'));
      else if (e.key === 'Enter') save();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  return (
    <div className="mx-auto flex max-w-md flex-col">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-[-0.035em]">Quick add</h1>
        <Link to="/expenses/new" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
          <PencilSimpleLine size={15} /> Full form
        </Link>
      </div>

      {!online && (
        <p className="mt-3 flex items-center gap-2 rounded-md bg-warn-soft px-3 py-2 text-sm text-warn-ink">
          <CloudSlash size={16} weight="bold" className="shrink-0" /> You are offline. Entries are saved here and sync later.
        </p>
      )}

      <output htmlFor="keypad" aria-live="polite" className="mt-6 flex items-baseline justify-center gap-1.5 py-3" aria-label={`Amount ${money(value)}`}>
        <span className={`text-3xl font-medium ${amount ? 'text-muted' : 'text-faint'}`}>₹</span>
        <span className={`amount text-6xl font-semibold ${amount ? 'text-ink' : 'text-line-strong'}`}>{shown(amount)}</span>
      </output>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="radiogroup" aria-label="Category">
        {chips.map((name) => {
          const on = category === name;
          return (
            <button key={name} type="button" role="radio" aria-checked={on} onClick={() => setCategory(name)}
              className={`flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors ${
                on ? 'border-ink bg-subtle font-medium text-ink shadow-[inset_0_0_0_1px_var(--ink)]' : 'border-line bg-surface text-ink-soft hover:border-line-strong'}`}>
              <CategoryIcon name={name} size="sm" className="rounded-full" />{categoryInfo(name).label}
            </button>
          );
        })}
        <button type="button" onClick={() => setShowAll(!showAll)} aria-expanded={showAll}
          className="shrink-0 rounded-full border border-dashed border-line-strong px-3 py-1 text-sm text-muted hover:text-ink">
          {showAll ? 'Less' : 'More'}
        </button>
      </div>
      {showAll && (
        <div className="rise mt-2 grid grid-cols-4 gap-1.5">
          {CATEGORIES.map((c) => (
            <button key={c.name} type="button" onClick={() => { setCategory(c.name); setShowAll(false); }}
              className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] leading-tight transition-colors ${
                category === c.name ? 'border-ink bg-subtle' : 'border-transparent hover:bg-subtle'}`}>
              <CategoryIcon name={c.name} size="sm" />{c.label || c.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input className="input flex-1" maxLength={100} placeholder="Title (optional)"
          value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} aria-label="Title" />
        <div className="inline-flex shrink-0 rounded-md border border-line bg-surface p-0.5" role="radiogroup" aria-label="Day">
          {[['today', 'Today'], ['yesterday', 'Yesterday']].map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={day === k} onClick={() => setDay(k)}
              className={`rounded px-2.5 text-xs transition-colors ${day === k ? 'bg-subtle font-medium text-ink' : 'text-muted'}`}>{label}</button>
          ))}
        </div>
      </div>

      <div id="keypad" className="mt-4 grid select-none grid-cols-3 gap-2">
        {KEYS.map((k) => (
          <button key={k} type="button" onClick={() => setAmount((a) => press(a, k))} aria-label={k === 'back' ? 'Delete digit' : k}
            className="grid h-14 place-items-center rounded-lg bg-surface text-2xl font-medium tabular-nums text-ink shadow-[inset_0_0_0_1px_var(--line)] transition-[background-color,transform] duration-150 active:scale-[0.96] active:bg-subtle sm:h-16">
            {k === 'back' ? <Backspace size={24} /> : k}
          </button>
        ))}
      </div>

      <button type="button" onClick={save} disabled={!canSave} className="btn btn-primary mt-4 h-13 text-base">
        {saving ? <><InlineSpinner /> Saving…</>
          : !category && value > 0 ? 'Pick a category'
            : `Add ${value > 0 ? money(value) : 'expense'}`}
      </button>
      {pending.length > 0 && (
        <Link to="/expenses" className="mt-3 text-center text-xs text-warn-ink">
          {pending.length} entr{pending.length === 1 ? 'y is' : 'ies are'} waiting to sync
        </Link>
      )}
    </div>
  );
}
