// Arpit's salary plan (Rs. 66,000 take-home). Fixed payments go out on salary day;
// Rs. 12,500 is for day-to-day spending and Rs. 9,500 moves to the savings account.
export const SALARY_PLAN = {
  monthlyIncome: 66000,
  savingsTarget: 9500,
  monthlyLimit: 56500,
  alertThreshold: 80,
  fixedCategories: ['EMI', 'Parents', 'Rent', 'Bills', 'Subscriptions'],
  categoryLimits: {
    EMI: 15000,
    Parents: 15000,
    Rent: 9000,
    Bills: 3000,
    Subscriptions: 2000,
    Food: 6500,
    Transport: 2000,
    'Personal & Fun': 3000,
    Other: 1000,
  },
};
