import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  addExpense,
  filterExpenses,
  formatCurrency,
  makeExpense,
  normalizeAmount,
  removeExpense,
  sortByDate,
  total,
  totalsByCategory,
} from './expenses.js';

describe('normalizeAmount', () => {
  it('accepts numbers and numeric strings', () => {
    expect(normalizeAmount('12.5')).toBe(12.5);
    expect(normalizeAmount(3)).toBe(3);
    expect(normalizeAmount('$1,234.56')).toBe(1234.56);
  });

  it('rounds to two decimals', () => {
    expect(normalizeAmount('1.234')).toBe(1.23);
    expect(normalizeAmount('1.999')).toBe(2);
  });

  it('rejects invalid, zero and negative values', () => {
    expect(normalizeAmount('')).toBeNull();
    expect(normalizeAmount('abc')).toBeNull();
    expect(normalizeAmount(0)).toBeNull();
    expect(normalizeAmount('-5')).toBeNull();
  });
});

describe('makeExpense / addExpense', () => {
  it('builds a normalized expense', () => {
    const expense = makeExpense({ description: '  Lunch ', amount: '15.5', category: 'Food', date: '2024-05-01' });
    expect(expense).toMatchObject({ description: 'Lunch', amount: 15.5, category: 'Food', date: '2024-05-01' });
    expect(expense.id).toBeTruthy();
  });

  it('falls back to Untitled and Other', () => {
    const expense = makeExpense({ description: '   ', amount: 2, category: 'Nope' });
    expect(expense.description).toBe('Untitled');
    expect(expense.category).toBe('Other');
  });

  it('returns null for an invalid amount', () => {
    expect(makeExpense({ description: 'x', amount: 'n/a' })).toBeNull();
  });

  it('prepends new expenses and ignores invalid ones', () => {
    const list = [{ id: 'a', description: 'A', amount: 1, category: 'Food', date: '2024-01-01' }];
    const withNew = addExpense(list, { description: 'B', amount: 2, category: 'Fun' });
    expect(withNew).toHaveLength(2);
    expect(withNew[0].description).toBe('B');
    expect(addExpense(list, { description: 'C', amount: 'bad' })).toBe(list);
  });
});

describe('removeExpense / total', () => {
  const list = [
    { id: 'a', description: 'A', amount: 10, category: 'Food', date: '2024-01-01' },
    { id: 'b', description: 'B', amount: 2.5, category: 'Fun', date: '2024-02-01' },
  ];

  it('removes by id', () => {
    expect(removeExpense(list, 'a').map((e) => e.id)).toEqual(['b']);
    expect(removeExpense(list, 'missing')).toHaveLength(2);
  });

  it('sums and rounds floating point', () => {
    expect(total(list)).toBe(12.5);
    expect(total([{ amount: 0.1 }, { amount: 0.2 }])).toBe(0.3);
  });
});

describe('totalsByCategory', () => {
  it('groups, sums and sorts descending', () => {
    const list = [
      { category: 'Food', amount: 10 },
      { category: 'Fun', amount: 25 },
      { category: 'Food', amount: 5 },
    ];
    expect(totalsByCategory(list)).toEqual([
      { category: 'Fun', amount: 25 },
      { category: 'Food', amount: 15 },
    ]);
  });
});

describe('filterExpenses', () => {
  const list = [
    { description: 'Coffee', category: 'Food', date: '2024-01-01', amount: 4 },
    { description: 'Bus pass', category: 'Transport', date: '2024-01-05', amount: 30 },
    { description: 'Cake', category: 'Food', date: '2024-01-09', amount: 12 },
  ];

  it('filters by category', () => {
    expect(filterExpenses(list, { category: 'Food' })).toHaveLength(2);
    expect(filterExpenses(list, { category: 'all' })).toHaveLength(3);
  });

  it('filters by case-insensitive query', () => {
    expect(filterExpenses(list, { query: 'ca' }).map((e) => e.description)).toEqual(['Cake']);
  });

  it('combines both filters', () => {
    expect(filterExpenses(list, { category: 'Food', query: 'cof' }).map((e) => e.description)).toEqual(['Coffee']);
  });
});

describe('sortByDate / formatCurrency', () => {
  const list = [
    { date: '2024-01-01' },
    { date: '2024-03-01' },
    { date: '2024-02-01' },
  ];

  it('sorts descending by default and ascending on request', () => {
    expect(sortByDate(list).map((e) => e.date)).toEqual(['2024-03-01', '2024-02-01', '2024-01-01']);
    expect(sortByDate(list, 'asc').map((e) => e.date)).toEqual(['2024-01-01', '2024-02-01', '2024-03-01']);
  });

  it('does not mutate the input', () => {
    const copy = [...list];
    sortByDate(list);
    expect(list).toEqual(copy);
  });

  it('formats currency', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('exposes a category list', () => {
    expect(CATEGORIES).toContain('Food');
  });
});
