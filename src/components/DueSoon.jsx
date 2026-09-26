import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { moneyShort } from '../lib/format';
import { CalendarCheck } from '../lib/icons';
import { listRecurring } from '../lib/recurring';

/**
 * A note on the dashboard about recurring payments due tomorrow. Loading the list also makes the API
 * log any payment that fell due while the server was asleep.
 */
export default function DueSoon({ onLogged }) {
  const [due, setDue] = useState([]);

  useEffect(() => {
    let cancelled = false;
    listRecurring()
      .then((items) => { if (!cancelled) setDue(items.filter((i) => i.active && i.dueTomorrow)); })
      .catch(() => {}) // Not worth an error on the dashboard.
      .finally(() => !cancelled && onLogged?.());
    return () => { cancelled = true; };
    // Runs once per dashboard visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!due.length) return null;
  const total = due.reduce((s, i) => s + i.amount, 0);
  return (
    <div className="rise flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
      <CalendarCheck size={20} className="shrink-0 text-muted" />
      <p className="flex-1">
        Due tomorrow: {due.map((i) => `${i.title} ${moneyShort(i.amount)}`).join(', ')}
        {due.length > 1 && <> (<span className="amount">{moneyShort(total)}</span>)</>}. It will be logged automatically.
      </p>
      <Link to="/recurring" className="link text-sm">Recurring payments</Link>
    </div>
  );
}
