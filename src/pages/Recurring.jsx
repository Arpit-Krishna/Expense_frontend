import { useEffect, useState } from 'react';
import { errorMessage, fieldErrors } from '../lib/api';
import { CATEGORIES, categoryInfo } from '../lib/categories';
import { formatDate, moneyShort } from '../lib/format';
import { ArrowsClockwise, CalendarCheck, Pause, PencilSimple, Play, Plus, Trash } from '../lib/icons';
import {
  addDefaultRecurring, createRecurring, deleteRecurring, listRecurring, logRecurringNow, ordinal, updateRecurring,
} from '../lib/recurring';
import { useToast } from '../components/Toast';
import CategoryIcon from '../components/CategoryIcon';
import PageHeader from '../components/PageHeader';
import Spinner, { InlineSpinner } from '../components/Spinner';

const EMPTY = { title: '', category: 'EMI', amount: '', dayOfMonth: '1', note: '', active: true };

export default function Recurring() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null, 'new', or an id
  const [busy, setBusy] = useState('');

  const load = () => listRecurring().then(setItems);

  useEffect(() => {
    load().catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  const run = async (key, fn, success) => {
    setBusy(key);
    try {
      await fn();
      await load();
      if (success) toast(success, 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy('');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="card text-center text-bad-ink">{error}</p>;

  const active = items.filter((i) => i.active);
  const total = active.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <PageHeader title="Recurring payments"
        subtitle="Fixed payments log themselves on their due day, so you only add day-to-day spending. You get an email the day before if email alerts are on.">
        {items.length > 0 && editing !== 'new' && (
          <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={15} weight="bold" /> Add payment</button>
        )}
      </PageHeader>

      {editing === 'new' && (
        <PaymentForm initial={EMPTY} busy={busy === 'save'} onCancel={() => setEditing(null)}
          onSave={(body) => run('save', () => createRecurring(body).then(() => setEditing(null)), 'Recurring payment added')} />
      )}

      {items.length === 0 && editing !== 'new' ? (
        <section className="card rise flex flex-col items-center gap-4 py-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-subtle text-muted"><ArrowsClockwise size={24} /></span>
          <div>
            <h2 className="text-base font-semibold">No recurring payments yet</h2>
            <p className="mt-1 max-w-md text-sm text-muted">
              Start with EMI, money to parents, rent, bills and your subscription. You can change the amounts and due days after.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button className="btn btn-primary" disabled={busy === 'defaults'}
              onClick={() => run('defaults', addDefaultRecurring, 'Added your usual payments. Check the due days.')}>
              {busy === 'defaults' ? <><InlineSpinner /> Adding…</> : 'Add my usual payments'}
            </button>
            <button className="btn btn-secondary" onClick={() => setEditing('new')}>Add one myself</button>
          </div>
        </section>
      ) : items.length > 0 && (
        <section className="card rise" style={{ '--i': 1 }}>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-base font-semibold tracking-tight">Every month</h2>
            <p className="text-sm text-muted"><span className="amount font-semibold text-ink">{moneyShort(total)}</span> a month</p>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {items.map((item) => (editing === item.id ? (
              <li key={item.id} className="py-4">
                <PaymentForm inline initial={{ ...item, amount: String(item.amount), dayOfMonth: String(item.dayOfMonth), note: item.note || '' }}
                  busy={busy === 'save'} onCancel={() => setEditing(null)}
                  onSave={(body) => run('save', () => updateRecurring(item.id, body).then(() => setEditing(null)), 'Saved')} />
              </li>
            ) : (
              <PaymentRow key={item.id} item={item} busy={busy}
                onEdit={() => setEditing(item.id)}
                onLog={() => run(`log-${item.id}`, () => logRecurringNow(item.id), `${item.title} logged for this month`)}
                onToggle={() => run(`toggle-${item.id}`, () => updateRecurring(item.id, { ...item, active: !item.active }),
                  item.active ? 'Paused' : 'Resumed')}
                onDelete={() => {
                  if (window.confirm(`Delete ${item.title}? Expenses it already logged stay.`)) {
                    run(`del-${item.id}`, () => deleteRecurring(item.id), 'Deleted');
                  }
                }} />
            )))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PaymentRow({ item, busy, onEdit, onLog, onToggle, onDelete }) {
  const info = categoryInfo(item.category);
  return (
    <li className="py-4">
      <div className={`flex items-center gap-3 ${item.active ? '' : 'opacity-60'}`}>
        <CategoryIcon name={item.category} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="truncate text-xs text-muted">
            {info.label} · on the {ordinal(item.dayOfMonth)}
            {item.active ? ` · next ${formatDate(item.nextDue)}` : ' · paused'}
          </p>
        </div>
        <span className="amount shrink-0 text-sm font-semibold">{moneyShort(item.amount)}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 pl-11">
        {item.active && item.dueTomorrow && <span className="rounded-full bg-warn-soft px-2 py-0.5 text-xs font-medium text-warn-ink">Due tomorrow</span>}
        {item.loggedThisMonth && <span className="flex items-center gap-1 rounded-full bg-ok-soft px-2 py-0.5 text-xs font-medium text-ok-ink"><CalendarCheck size={12} /> Logged this month</span>}
        <div className="ml-auto flex items-center gap-1">
          {item.active && !item.loggedThisMonth && (
            <button className="btn btn-ghost h-8 px-2 text-xs" onClick={onLog} disabled={busy === `log-${item.id}`} title="Log this month's payment now">
              {busy === `log-${item.id}` ? <InlineSpinner /> : 'Log now'}
            </button>
          )}
          <button className="btn btn-ghost h-8 w-8 p-0" onClick={onToggle} aria-label={item.active ? `Pause ${item.title}` : `Resume ${item.title}`}
            title={item.active ? 'Pause' : 'Resume'} disabled={busy === `toggle-${item.id}`}>
            {item.active ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className="btn btn-ghost h-8 w-8 p-0" onClick={onEdit} aria-label={`Edit ${item.title}`} title="Edit"><PencilSimple size={16} /></button>
          <button className="btn btn-ghost h-8 w-8 p-0 text-bad-ink" onClick={onDelete} aria-label={`Delete ${item.title}`} title="Delete"
            disabled={busy === `del-${item.id}`}><Trash size={16} /></button>
        </div>
      </div>
    </li>
  );
}

function PaymentForm({ initial, onSave, onCancel, busy, inline }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = 'Give it a name';
    if (!(Number(form.amount) > 0)) next.amount = 'Enter an amount';
    const day = Number(form.dayOfMonth);
    if (!Number.isInteger(day) || day < 1 || day > 31) next.dayOfMonth = 'Pick a day from 1 to 31';
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await onSave({ title: form.title.trim(), category: form.category, amount: Number(form.amount), dayOfMonth: day,
        note: form.note.trim() || null, active: form.active });
    } catch (err) {
      setErrors(fieldErrors(err));
    }
  };

  const categories = CATEGORIES.some((c) => c.name === form.category) ? CATEGORIES : [...CATEGORIES, { name: form.category }];

  return (
    <form onSubmit={submit} className={inline ? 'space-y-4' : 'card rise space-y-4'} noValidate>
      {!inline && <h2 className="text-base font-semibold tracking-tight">New recurring payment</h2>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="r-title" label="Name" error={errors.title}>
          <input id="r-title" className={`input ${errors.title ? 'input-error' : ''}`} placeholder="e.g. Home loan EMI"
            value={form.title} onChange={set('title')} maxLength={100} />
        </Field>
        <Field id="r-category" label="Category">
          <select id="r-category" className="input" value={form.category} onChange={set('category')}>
            {categories.map((c) => <option key={c.name} value={c.name}>{categoryInfo(c.name).label}</option>)}
          </select>
        </Field>
        <Field id="r-amount" label="Amount" error={errors.amount}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-faint">₹</span>
            <input id="r-amount" type="number" min="1" inputMode="decimal" className={`input amount pl-7 ${errors.amount ? 'input-error' : ''}`}
              value={form.amount} onChange={set('amount')} />
          </div>
        </Field>
        <Field id="r-day" label="Due on day" error={errors.dayOfMonth}
          hint={Number(form.dayOfMonth) > 28 ? 'In shorter months it is logged on the last day.' : 'Day of the month it goes out.'}>
          <input id="r-day" type="number" min="1" max="31" inputMode="numeric" className={`input amount ${errors.dayOfMonth ? 'input-error' : ''}`}
            value={form.dayOfMonth} onChange={set('dayOfMonth')} />
        </Field>
      </div>
      <Field id="r-note" label="Note (optional)" error={errors.note}>
        <input id="r-note" className="input" value={form.note} onChange={set('note')} maxLength={500} placeholder="e.g. Auto-debit from salary account" />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-[var(--ink)]" checked={form.active} onChange={set('active')} />
          Log it automatically each month
        </label>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <><InlineSpinner /> Saving…</> : 'Save'}</button>
        </div>
      </div>
    </form>
  );
}

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? <p className="field-error">{error}</p> : hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
