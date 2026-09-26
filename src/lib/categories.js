// Day-to-day categories first, then the fixed monthly payments.
export const CATEGORIES = [
  { name: 'Food', label: 'Food & groceries', icon: '🍔', color: '#f97316' },
  { name: 'Transport', icon: '🚕', color: '#0ea5e9' },
  { name: 'Personal & Fun', icon: '🎉', color: '#ec4899' },
  { name: 'Shopping', icon: '🛍️', color: '#f43f5e' },
  { name: 'Health', icon: '💊', color: '#10b981' },
  { name: 'Travel', icon: '✈️', color: '#14b8a6' },
  { name: 'Education', icon: '📚', color: '#6366f1' },
  { name: 'Other', label: 'Miscellaneous', icon: '📦', color: '#64748b' },
  { name: 'Rent', icon: '🏠', color: '#8b5cf6' },
  { name: 'EMI', label: 'Loan EMI', icon: '🏦', color: '#0f766e' },
  { name: 'Parents', label: 'Parents / family', icon: '👪', color: '#d97706' },
  { name: 'Bills', label: 'Bills & utilities', icon: '💡', color: '#eab308' },
  { name: 'Subscriptions', icon: '🔁', color: '#a855f7' },
];

// Older expenses may use these names.
const LEGACY = [
  { name: 'Groceries', icon: '🛒', color: '#84cc16' },
  { name: 'Utilities', icon: '💡', color: '#eab308' },
  { name: 'Entertainment', icon: '🎬', color: '#db2777' },
];

const BY_NAME = Object.fromEntries([...CATEGORIES, ...LEGACY].map((c) => [c.name.toLowerCase(), c]));

export function categoryInfo(name) {
  const c = BY_NAME[(name || '').toLowerCase()] || { name: name || 'Other', icon: '📦', color: '#64748b' };
  return { ...c, label: c.label || c.name };
}

/** The API falls back to the old description field, but guard here too. */
export function expenseCategory(expense) {
  return expense?.category || expense?.description || 'Other';
}

/** The note, unless it is just the category copied over from older records. */
export function expenseNote(expense) {
  const d = expense?.description;
  return d && d !== expenseCategory(expense) ? d : '';
}
