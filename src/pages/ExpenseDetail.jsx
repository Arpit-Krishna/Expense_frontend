import { ArrowLeft, PencilSimple, Trash } from '../lib/icons';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { categoryInfo, expenseCategory, expenseNote } from '../lib/categories';
import { formatDate, formatDateTime, money } from '../lib/format';
import { useToast } from '../components/Toast';
import CategoryIcon from '../components/CategoryIcon';
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
      <div className="card mx-auto flex max-w-xl flex-col items-center gap-4 py-12 text-center">
        <p>{error}</p>
        <Link to="/expenses" className="btn btn-secondary">Back to expenses</Link>
      </div>
    );
  }
  if (!expense) return <Spinner />;

  const name = expenseCategory(expense);
  const cat = categoryInfo(name);
  const note = expenseNote(expense);

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/expenses" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft size={14} /> All expenses
      </Link>
      <article className="card rise mt-4 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <CategoryIcon name={name} />
          <p className="text-sm text-muted">{cat.label}</p>
        </div>
        <h1 className="mt-5 break-words font-serif text-4xl leading-tight tracking-[-0.02em]">{expense.title}</h1>
        <p className="amount mt-2 text-4xl font-semibold">{money(expense.amount)}</p>

        <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-line pt-6 text-sm">
          <div><dt className="text-muted">Date</dt><dd className="mt-1 font-medium">{formatDate(expense.date)}</dd></div>
          <div><dt className="text-muted">Category</dt><dd className="mt-1 font-medium">{cat.label}</dd></div>
          {note && <div className="col-span-2"><dt className="text-muted">Note</dt><dd className="mt-1 whitespace-pre-wrap font-medium">{note}</dd></div>}
          {expense.createdAt && <div><dt className="text-muted">Added</dt><dd className="mt-1">{formatDateTime(expense.createdAt)}</dd></div>}
          {expense.updatedAt && expense.updatedAt !== expense.createdAt && <div><dt className="text-muted">Last edited</dt><dd className="mt-1">{formatDateTime(expense.updatedAt)}</dd></div>}
        </dl>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
          <Link to={`/expenses/${id}/edit`} className="btn btn-primary flex-1"><PencilSimple size={15} /> Edit</Link>
          {confirming ? (
            <>
              <button className="btn btn-danger" onClick={remove} disabled={deleting}>{deleting ? 'Deleting…' : 'Yes, delete'}</button>
              <button className="btn btn-secondary" onClick={() => setConfirming(false)}>Keep</button>
            </>
          ) : (
            <button className="btn btn-secondary text-bad-ink" onClick={() => setConfirming(true)}><Trash size={15} /> Delete</button>
          )}
        </div>
      </article>
    </div>
  );
}
