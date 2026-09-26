import { budgetAlerts } from '../lib/budget';

export default function BudgetAlerts({ status }) {
  const alerts = budgetAlerts(status);
  if (!alerts.length) return null;
  const over = alerts.some((a) => a.level === 'over');
  return (
    <div role="alert" className={`rounded-2xl border p-4 ${over
      ? 'border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/60 dark:text-red-100'
      : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-100'}`}>
      <p className="font-semibold">{over ? '🚨 You are overspending' : '⚠️ Heads up on your budget'}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
        {alerts.map((a) => <li key={a.text}>{a.text}</li>)}
      </ul>
    </div>
  );
}
