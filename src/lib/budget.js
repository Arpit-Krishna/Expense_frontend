import { api } from './api';
import { money, today } from './format';

export async function fetchBudgetStatus(month) {
  const res = await api.get('/api/budget/status', { params: { month, today: today() } });
  return res.data;
}

export const LEVEL_STYLES = {
  ok: { bar: 'bg-ok', text: 'text-ok-ink', badge: 'bg-ok-soft text-ok-ink', label: 'On track' },
  warning: { bar: 'bg-warn', text: 'text-warn-ink', badge: 'bg-warn-soft text-warn-ink', label: 'Close to limit' },
  over: { bar: 'bg-bad', text: 'text-bad-ink', badge: 'bg-bad-soft text-bad-ink', label: 'Over budget' },
  none: { bar: 'bg-faint', text: 'text-muted', badge: 'bg-subtle text-muted', label: 'No limit' },
};

/** Alert lines built from the status numbers, formatted in rupees. */
export function budgetAlerts(status) {
  if (!status) return [];
  const out = [];
  if (status.level === 'over') {
    out.push({ key: 'month', level: 'over', text: `You are ${money(status.spent - status.monthlyLimit)} over your monthly budget of ${money(status.monthlyLimit)}.` });
  } else if (status.level === 'warning') {
    out.push({ key: 'month', level: 'warning', text: `You have used ${Math.round(status.percent)}% of your monthly budget. ${money(status.remaining)} left for ${status.daysLeft} days.` });
  }
  for (const c of status.categories || []) {
    if (c.level === 'over') out.push({ key: `cat:${c.category}`, level: 'over', text: `${c.category} is ${money(c.spent - c.limit)} over its ${money(c.limit)} limit.` });
    else if (c.level === 'warning') out.push({ key: `cat:${c.category}`, level: 'warning', text: `${c.category} has used ${Math.round(c.percent)}% of its ${money(c.limit)} limit.` });
  }
  if (status.spendableLevel === 'over') {
    out.push({ key: 'spendable', level: 'over', text: `Day-to-day spending is ${money(status.spendableSpent - status.spendableLimit)} over its ${money(status.spendableLimit)} budget.` });
  } else if (status.spendableLevel === 'warning') {
    out.push({ key: 'spendable', level: 'warning', text: `Day-to-day spending has used ${Math.round(status.spendablePercent)}% of ${money(status.spendableLimit)}. ${money(status.spendableLimit - status.spendableSpent)} left.` });
  }
  if (status.monthlyIncome > 0 && status.savingsTarget > 0 && status.savedSoFar < status.savingsTarget) {
    out.push({ key: 'savings', level: 'over', text: `Spending is eating into your savings: only ${money(Math.max(0, status.savedSoFar))} of your ${money(status.savingsTarget)} savings target is left.` });
  }
  if (status.monthlyLimit > 0 && status.level !== 'over' && status.daysLeft > 0 && status.projectedSpend > status.monthlyLimit) {
    out.push({ key: 'pace', level: 'warning', text: `At this pace you will spend about ${money(status.projectedSpend)} this month, above your ${money(status.monthlyLimit)} limit.` });
  }
  return out;
}

/** Alerts that appeared or got worse between two statuses, e.g. right after saving an expense. */
export function newAlerts(before, after) {
  const seen = new Set(budgetAlerts(before).map((a) => `${a.key}|${a.level}`));
  return budgetAlerts(after).filter((a) => !seen.has(`${a.key}|${a.level}`));
}
