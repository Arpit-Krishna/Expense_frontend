import {
  AirplaneTilt, ArrowsClockwise, Bank, Basket, BookOpen, Confetti, FilmSlate, FirstAidKit, ForkKnife,
  HouseLine, Lightbulb, Lightning, Package, ShoppingBag, Taxi, UsersThree,
} from './icons';

// Day-to-day categories first, then the fixed monthly payments.
export const CATEGORIES = [
  { name: 'Food', label: 'Food & groceries', icon: ForkKnife, color: '#c0763a' },
  { name: 'Transport', icon: Taxi, color: '#3f7fa6' },
  { name: 'Personal & Fun', icon: Confetti, color: '#b0607f' },
  { name: 'Shopping', icon: ShoppingBag, color: '#b5575e' },
  { name: 'Health', icon: FirstAidKit, color: '#4e8a6a' },
  { name: 'Travel', icon: AirplaneTilt, color: '#3f8c87' },
  { name: 'Education', icon: BookOpen, color: '#6a6fa8' },
  { name: 'Other', label: 'Miscellaneous', icon: Package, color: '#7d7a74' },
  { name: 'Rent', icon: HouseLine, color: '#7f68a6' },
  { name: 'EMI', label: 'Loan EMI', icon: Bank, color: '#3d7470' },
  { name: 'Parents', label: 'Parents / family', icon: UsersThree, color: '#a87a3a' },
  { name: 'Bills', label: 'Bills & utilities', icon: Lightning, color: '#b39537' },
  { name: 'Subscriptions', icon: ArrowsClockwise, color: '#8c6aa8' },
];

// Older expenses may use these names.
const LEGACY = [
  { name: 'Groceries', icon: Basket, color: '#7e9449' },
  { name: 'Utilities', icon: Lightbulb, color: '#b39537' },
  { name: 'Entertainment', icon: FilmSlate, color: '#a85f82' },
];

const BY_NAME = Object.fromEntries([...CATEGORIES, ...LEGACY].map((c) => [c.name.toLowerCase(), c]));

export function categoryInfo(name) {
  const c = BY_NAME[(name || '').toLowerCase()] || { name: name || 'Other', icon: Package, color: '#7d7a74' };
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
