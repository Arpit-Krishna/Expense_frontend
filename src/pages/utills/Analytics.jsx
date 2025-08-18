
import dayjs from "dayjs";

// Group by category
export function getCategoryBreakdown(expenses) {
  const breakdown = {};
  expenses.forEach(exp => {
    if (!breakdown[exp.description]) breakdown[exp.description] = 0;
    breakdown[exp.description] += exp.amount;
  });
  return Object.entries(breakdown).map(([description, amount]) => ({ description, amount }));
}

// Group by month
export function getMonthlyTrend(expenses) {
  const trend = {};
  expenses.forEach(exp => {
    const month = dayjs(exp.date).format("MMM");
    if (!trend[month]) trend[month] = 0;
    trend[month] += exp.amount;
  });
  return Object.entries(trend).map(([month, amount]) => ({ month, amount }));
}
