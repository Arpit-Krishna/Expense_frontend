import { Link } from 'react-router-dom';
import { categoryInfo, expenseCategory, expenseNote } from '../lib/categories';
import { formatDate, money } from '../lib/format';

export default function ExpenseRow({ expense }) {
  const cat = categoryInfo(expenseCategory(expense));
  const note = expenseNote(expense);
  return (
    <li>
      <Link to={`/expenses/${expense.id}`} className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg" style={{ backgroundColor: `${cat.color}22` }}>{cat.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{expense.title}</p>
          <p className="truncate text-sm muted">{cat.label} · {formatDate(expense.date)}{note ? ` · ${note}` : ''}</p>
        </div>
        <span className="shrink-0 font-semibold tabular-nums">{money(expense.amount)}</span>
      </Link>
    </li>
  );
}
