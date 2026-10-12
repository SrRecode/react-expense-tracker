/** Pure expense helpers. No React, no DOM — safe to unit test directly. */

export const CATEGORIES = ['Food', 'Transport', 'Housing', 'Utilities', 'Fun', 'Other'];

let counter = 0;
function genId() {
  counter += 1;
  return `e_${Date.now().toString(36)}_${counter.toString(36)}`;
}

/** Parse a user-entered amount into a positive number rounded to 2 decimals. */
export function normalizeAmount(value) {
  const numeric = Number(String(value).replace(/[^0-9.\-]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric * 100) / 100;
}

export function makeExpense({ description = '', amount, category = 'Other', date, id } = {}) {
  const normalized = normalizeAmount(amount);
  if (normalized === null) return null;
  return {
    id: id ?? genId(),
    description: description.trim() || 'Untitled',
    amount: normalized,
    category: CATEGORIES.includes(category) ? category : 'Other',
    date: date ?? new Date().toISOString().slice(0, 10),
  };
}

export function addExpense(expenses, fields) {
  const expense = makeExpense(fields);
  if (!expense) return expenses;
  return [expense, ...expenses];
}

export function removeExpense(expenses, id) {
  return expenses.filter((expense) => expense.id !== id);
}

export function total(expenses) {
  const sum = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  return Math.round(sum * 100) / 100;
}

/** Totals per category, largest first. Categories with no spending are omitted. */
export function totalsByCategory(expenses) {
  const map = new Map();
  for (const expense of expenses) {
    map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amount);
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => b.amount - a.amount);
}

export function filterExpenses(expenses, { category = 'all', query = '' } = {}) {
  const q = String(query ?? '').trim().toLowerCase();
  return expenses.filter((expense) => {
    const matchesCategory = category === 'all' || expense.category === category;
    const matchesQuery = !q || expense.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}

/** Most recent first (ISO date strings sort lexicographically). */
export function sortByDate(expenses, direction = 'desc') {
  const sign = direction === 'asc' ? 1 : -1;
  return [...expenses].sort((a, b) => sign * a.date.localeCompare(b.date));
}

export function formatCurrency(amount, { currency = 'USD', locale = 'en-US' } = {}) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
