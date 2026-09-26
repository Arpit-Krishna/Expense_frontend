import { ArrowLeft } from '../lib/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage, fieldErrors } from '../lib/api';
import { fetchBudgetStatus, newAlerts } from '../lib/budget';
import { createExpense } from '../lib/offline';
import { CATEGORIES, expenseCategory, expenseNote } from '../lib/categories';
import { toApiDateTime, today } from '../lib/format';
import { useToast } from '../components/Toast';
import CategoryIcon from '../components/CategoryIcon';
import Spinner, { InlineSpinner } from '../components/Spinner';

const empty = { title: '', amount: '', category: '', date: today(), note: '' };

export default function ExpenseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [original, setOriginal] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [addAnother, setAddAnother] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/expense/${id}`)
      .then((res) => {
        const e = res.data;
        setOriginal(e);
        setForm({
          title: e.title,
          amount: String(e.amount),
          category: expenseCategory(e),
          date: e.date ? dayjs(e.date).format('YYYY-MM-DD') : today(),
          note: expenseNote(e),
        });
      })
      .catch((err) => { toast(errorMessage(err, 'Could not load that expense.'), 'error'); navigate('/expenses'); })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, toast]);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Give it a short title.';
    const amount = Number(form.amount);
    if (form.amount === '' || Number.isNaN(amount)) e.amount = 'Enter an amount.';
    else if (amount <= 0) e.amount = 'Amount must be more than zero.';
    if (!form.category) e.category = 'Pick a category.';
    if (!form.date) e.date = 'Pick a date.';
    else if (dayjs(form.date).isAfter(dayjs(), 'day')) e.date = 'The date cannot be in the future.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const month = form.date.slice(0, 7);
    const payload = {
      title: form.title.trim(),
      amount: Math.round(Number(form.amount) * 100) / 100,
      category: form.category,
      description: form.note.trim() || null,
      // Keep the original time of day when only other fields changed.
      date: isEdit && original?.date && dayjs(original.date).format('YYYY-MM-DD') === form.date
        ? original.date
        : toApiDateTime(form.date),
    };
    try {
      const before = await fetchBudgetStatus(month).catch(() => null);
      let saved;
      if (isEdit) {
        saved = (await api.put(`/api/expense/${id}`, payload)).data;
      } else {
        const result = await createExpense(payload);
        if (result.queued) {
          toast('You are offline. The expense is saved on this device and will sync when you reconnect.', 'warning', 6000);
          if (addAnother) setForm({ ...empty, category: form.category, date: form.date });
          else navigate('/expenses', { replace: true });
          return;
        }
        saved = result.expense;
      }
      toast(isEdit ? 'Expense updated' : 'Expense added', 'success');
      const after = await fetchBudgetStatus(month).catch(() => null);
      newAlerts(before, after).forEach((a) => toast(a.text, a.level === 'over' ? 'error' : 'warning', 8000));
      if (!isEdit && addAnother) {
        setForm({ ...empty, category: form.category, date: form.date });
      } else {
        navigate(`/expenses/${saved.id}`, { replace: true });
      }
    } catch (err) {
      setErrors(fieldErrors(err));
      toast(errorMessage(err, 'Could not save the expense.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-xl">
      <Link to={isEdit ? `/expenses/${id}` : '/expenses'} className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft size={14} /> Back
      </Link>
      <h1 className="page-title rise mt-3">{isEdit ? 'Edit expense' : 'Add expense'}</h1>

      <form onSubmit={submit} noValidate className="card rise mt-6 space-y-6" style={{ '--i': 1 }}>
        <div>
          <label htmlFor="amount" className="label">Amount</label>
          <div className={`flex items-baseline gap-2 border-b-2 pb-2 transition-colors focus-within:border-ink ${errors.amount ? 'border-bad' : 'border-line'}`}>
            <span className="text-3xl font-medium text-faint">₹</span>
            <input id="amount" type="number" inputMode="decimal" step="0.01" min="0" placeholder="0" autoFocus={!isEdit}
              className="amount w-full bg-transparent text-4xl font-semibold outline-none placeholder:text-line-strong"
              value={form.amount} onChange={(e) => set('amount', e.target.value)} aria-invalid={Boolean(errors.amount)} />
          </div>
          {errors.amount && <p className="field-error">{errors.amount}</p>}
        </div>

        <div>
          <label htmlFor="title" className="label">Title</label>
          <input id="title" maxLength={100} placeholder="e.g. Lunch with team" className={`input ${errors.title ? 'input-error' : ''}`}
            value={form.title} onChange={(e) => set('title', e.target.value)} />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <fieldset>
          <legend className="label">Category</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((c) => {
              const on = form.category === c.name;
              return (
                <button type="button" key={c.name} onClick={() => set('category', c.name)} aria-pressed={on}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-1.5 py-3 text-center text-xs font-medium leading-tight transition-[background-color,border-color,transform] duration-200 active:scale-[0.97] ${on
                    ? 'border-ink bg-subtle text-ink'
                    : 'border-line text-ink-soft hover:border-line-strong hover:bg-subtle'}`}>
                  <CategoryIcon name={c.name} size="sm" />{c.label || c.name}
                </button>
              );
            })}
          </div>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className="label">Date</label>
            <input id="date" type="date" max={today()} className={`input ${errors.date ? 'input-error' : ''}`} value={form.date} onChange={(e) => set('date', e.target.value)} />
            {errors.date && <p className="field-error">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="note" className="label">Note <span className="font-normal text-faint">(optional)</span></label>
            <input id="note" maxLength={500} placeholder="Anything to remember" className="input" value={form.note} onChange={(e) => set('note', e.target.value)} />
          </div>
        </div>

        {!isEdit && (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
            <input type="checkbox" className="h-4 w-4 accent-[var(--ink)]" checked={addAnother} onChange={(e) => setAddAnother(e.target.checked)} />
            Add another after saving
          </label>
        )}

        <div className="flex gap-3 border-t border-line pt-5">
          <button type="submit" className="btn btn-primary h-11 flex-1" disabled={saving}>
            {saving ? <><InlineSpinner /> Saving…</> : isEdit ? 'Save changes' : 'Add expense'}
          </button>
          <button type="button" className="btn btn-secondary h-11" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
