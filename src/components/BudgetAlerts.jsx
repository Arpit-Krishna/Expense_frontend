import { Warning, WarningOctagon } from '../lib/icons';
import { budgetAlerts } from '../lib/budget';

export default function BudgetAlerts({ status }) {
  const alerts = budgetAlerts(status);
  if (!alerts.length) return null;
  const over = alerts.some((a) => a.level === 'over');
  const Icon = over ? WarningOctagon : Warning;
  return (
    <div role="alert" className={`rise flex gap-3 rounded-xl border p-4 sm:p-5 ${over ? 'border-bad/25 bg-bad-soft' : 'border-warn/30 bg-warn-soft'}`}>
      <Icon size={22} weight="fill" className={`shrink-0 ${over ? 'text-bad' : 'text-warn'}`} />
      <div className="min-w-0">
        <p className={`font-semibold ${over ? 'text-bad-ink' : 'text-warn-ink'}`}>{over ? 'You are overspending' : 'Heads up on your budget'}</p>
        <ul className="mt-1.5 space-y-1 text-sm text-ink-soft">
          {alerts.map((a) => (
            <li key={a.text} className="flex gap-2">
              <span className={`mt-[7px] h-1 w-1 shrink-0 rounded-full ${a.level === 'over' ? 'bg-bad' : 'bg-warn'}`} />
              {a.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
