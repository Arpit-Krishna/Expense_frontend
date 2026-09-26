import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { categoryInfo, expenseCategory, expenseNote } from '../lib/categories';
import { formatDate, formatDateTime, money } from '../lib/format';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';

export default function ExpenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [expense, setExpense] = useState(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/api/expense/${id}`)
      .then((res) => setExpense(res.data))
      .catch((err) => setError(err.response?.status === 404 ? 'This expense does not exist or was deleted.' : errorMessage(err)));
  }, [id]);

  const remove = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/expense/${id}`);
      toast('Expense deleted', 'success');
      navigate('/expenses', { replace: true });
    } catch (err) {
      toast(errorMessage(err, 'Could not delete the expense.'), 'error');
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="card mx-auto max-w-xl text-center">
        <p>{error}</p>
        <Link to="/expenses" className="btn btn-secondary mt-4">Back to expenses</Link>
      </div>
    );
  }
  if (!expense) return <Spinner />;

  const cat = categoryInfo(expenseCategory(expense));
  const note = expenseNote(expense);

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/expenses" className="text-sm muted hover:underline">← All expenses</Link>
      <div className="card mt-3">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl" style={{ backgroundColor: `${cat.color}22` }}>{cat.icon}</span>
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-xl font-bold">{expense.title}</h1>
            <p className="text-sm muted">{cat.label}</p>
          </div>
          <p className="text-2xl font-bold tabular-nums">{money(expense.amount)}</p>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="muted">Date</dt><dd className="font-medium">{formatDate(expense.date)}</dd></div>
          <div><dt className="muted">Category</dt><dd className="font-medium">{cat.label}</dd></div>
          {note && <div className="col-span-2"><dt className="muted">Note</dt><dd className="whitespace-pre-wrap font-medium">{note}</dd></div>}
          {expense.createdAt && <div><dt className="muted">Added</dt><dd>{formatDateTime(expense.createdAt)}</dd></div>}
          {expense.updatedAt && expense.updatedAt !== expense.createdAt && <div><dt className="muted">Last edited</dt><dd>{formatDateTime(expense.updatedAt)}</dd></div>}
        </dl>

        <div className="mt-6 flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <Link to={`/expenses/${id}/edit`} className="btn btn-primary flex-1">Edit</Link>
          {confirming ? (
            <>
              <button className="btn btn-danger" onClick={remove} disabled={deleting}>{deleting ? 'Deleting…' : 'Yes, delete'}</button>
              <button className="btn btn-secondary" onClick={() => setConfirming(false)}>Keep</button>
            </>
          ) : (
            <button className="btn btn-secondary text-red-600 dark:text-red-400" onClick={() => setConfirming(true)}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}
