import { CaretLeft, CaretRight } from '../lib/icons';
import dayjs from 'dayjs';
import { monthLabel } from '../lib/format';

export default function MonthPicker({ month, onChange }) {
  const shift = (n) => onChange(dayjs(`${month}-01`).add(n, 'month').format('YYYY-MM'));
  const isCurrent = month === dayjs().format('YYYY-MM');
  return (
    <div className="inline-flex items-center rounded-md border border-line bg-surface p-0.5">
      <button className="btn btn-ghost h-8 w-8 p-0" onClick={() => shift(-1)} aria-label="Previous month"><CaretLeft size={15} weight="bold" /></button>
      <span className="min-w-36 text-center text-sm font-medium tabular-nums">{monthLabel(month)}</span>
      <button className="btn btn-ghost h-8 w-8 p-0" onClick={() => shift(1)} disabled={isCurrent} aria-label="Next month"><CaretRight size={15} weight="bold" /></button>
    </div>
  );
}
