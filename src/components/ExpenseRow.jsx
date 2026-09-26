import { Link } from 'react-router-dom';
import { categoryInfo, expenseCategory, expenseNote } from '../lib/categories';
import { formatDate, money } from '../lib/format';
import CategoryIcon from './CategoryIcon';

export default function ExpenseRow({ expense, showDate = true }) {
  const name = expenseCategory(expense);
  const cat = categoryInfo(name);
  const note = expenseNote(expense);
  const meta = [cat.label, showDate && formatDate(expense.date), note].filter(Boolean).join(' · ');
  return (
    <li>
      <Link to={`/expenses/${expense.id}`}
        className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-subtle focus-visible:bg-subtle focus-visible:outline-none">
        <CategoryIcon name={name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium">{expense.title}</p>
          <p className="truncate text-sm text-muted">{meta}</p>
        </div>
        <span className="amount shrink-0 text-[15px] font-medium">{money(expense.amount)}</span>
      </Link>
    </li>
  );
}
