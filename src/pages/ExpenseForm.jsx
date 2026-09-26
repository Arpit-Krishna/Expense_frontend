import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage, fieldErrors } from '../lib/api';
import { fetchBudgetStatus, newAlerts } from '../lib/budget';
import { CATEGORIES, expenseCategory, expenseNote } from '../lib/categories';
import { toApiDateTime, today } from '../lib/format';
import { useToast } from '../components/Toast';
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
      const res = isEdit ? await api.put(`/api/expense/${id}`, payload) : await api.post('/api/expense', payload);
      toast(isEdit ? 'Expense updated' : 'Expense added', 'success');
      const after = await fetchBudgetStatus(month).catch(() => null);
      newAlerts(before, after).forEach((a) => toast(a.text, a.level === 'over' ? 'error' : 'warning', 8000));
      if (!isEdit && addAnother) {
        setForm({ ...empty, category: form.category, date: form.date });
      } else {
        navigate(`/expenses/${res.data.id}`, { replace: true });
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
      <Link to={isEdit ? `/expenses/${id}` : '/expenses'} className="text-sm muted hover:underline">← Back</Link>
      <h1 className="mt-2 text-2xl font-bold">{isEdit ? 'Edit expense' : 'Add expense'}</h1>

      <form onSubmit={submit} noValidate className="card mt-4 space-y-5">
        <div>
          <label htmlFor="amount" className="label">Amount (₹)</label>
          <input id="amount" type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00" autoFocus={!isEdit}
            className={`input text-2xl font-semibold ${errors.amount ? 'input-error' : ''}`} value={form.amount} onChange={(e) => set('amount', e.target.value)} />
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
            {CATEGORIES.map((c) => (
              <button type="button" key={c.name} onClick={() => set('category', c.name)} aria-pressed={form.category === c.name}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${form.category === c.name
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'}`}>
                <span className="text-lg">{c.icon}</span>{c.label || c.name}
              </button>
            ))}
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
            <label htmlFor="note" className="label">Note (optional)</label>
            <input id="note" maxLength={500} placeholder="Anything to remember" className="input" value={form.note} onChange={(e) => set('note', e.target.value)} />
          </div>
        </div>

        {!isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={addAnother} onChange={(e) => setAddAnother(e.target.checked)} />
            Add another after saving
          </label>
        )}

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
            {saving ? <><InlineSpinner /> Saving…</> : isEdit ? 'Save changes' : 'Add expense'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
