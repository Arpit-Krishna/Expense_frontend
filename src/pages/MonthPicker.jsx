import dayjs from 'dayjs';
import { monthLabel } from '../lib/format';

export default function MonthPicker({ month, onChange }) {
  const shift = (n) => onChange(dayjs(`${month}-01`).add(n, 'month').format('YYYY-MM'));
  const isCurrent = month === dayjs().format('YYYY-MM');
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
      <button className="btn btn-ghost px-2 py-1" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
      <span className="min-w-32 text-center text-sm font-semibold">{monthLabel(month)}</span>
      <button className="btn btn-ghost px-2 py-1" onClick={() => shift(1)} disabled={isCurrent} aria-label="Next month">›</button>
    </div>
  );
}
