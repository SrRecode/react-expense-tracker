import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addExpense,
  filterExpenses,
  removeExpense,
  sortByDate,
  total,
  totalsByCategory,
} from '../lib/expenses.js';

export const EXPENSES_STORAGE_KEY = 'react-expense-tracker.expenses';

function load(storage) {
  try {
    const raw = storage.getItem(EXPENSES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useExpenses(storage = globalThis.localStorage) {
  const [expenses, setExpenses] = useState(() => load(storage));
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    try {
      storage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [expenses, storage]);

  const add = useCallback((fields) => {
    setExpenses((prev) => addExpense(prev, fields));
  }, []);

  const remove = useCallback((id) => {
    setExpenses((prev) => removeExpense(prev, id));
  }, []);

  const clear = useCallback(() => setExpenses([]), []);

  const visible = useMemo(
    () => sortByDate(filterExpenses(expenses, { category, query }), 'desc'),
    [expenses, category, query],
  );

  const summary = useMemo(
    () => ({ total: total(expenses), byCategory: totalsByCategory(expenses), count: expenses.length }),
    [expenses],
  );

  const visibleTotal = useMemo(() => total(visible), [visible]);

  return {
    expenses,
    visible,
    visibleTotal,
    summary,
    category,
    setCategory,
    query,
    setQuery,
    add,
    remove,
    clear,
  };
}
