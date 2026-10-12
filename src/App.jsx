import { useState } from 'react';
import { CATEGORIES, formatCurrency } from './lib/expenses.js';
import { useExpenses } from './hooks/useExpenses.js';

const today = () => new Date().toISOString().slice(0, 10);

export default function App({ storage } = {}) {
  const {
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
  } = useExpenses(storage);

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: today(),
  });
  const [error, setError] = useState('');

  function update(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const amount = Number(String(form.amount).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a positive amount.');
      return;
    }
    add(form);
    setError('');
    setForm((prev) => ({ ...prev, description: '', amount: '' }));
  }

  const maxCategory = summary.byCategory[0]?.amount ?? 0;

  return (
    <main className="app">
      <header className="app__head">
        <h1>Expense Tracker</h1>
        <p className="app__total">
          Total <strong>{formatCurrency(summary.total)}</strong> across {summary.count}{' '}
          {summary.count === 1 ? 'expense' : 'expenses'}
        </p>
      </header>

      <section className="panel">
        <h2 className="panel__title">Add an expense</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field field--wide">
            <span>Description</span>
            <input
              type="text"
              value={form.description}
              onChange={update('description')}
              placeholder="Coffee with the team"
            />
          </label>

          <label className="field">
            <span>Amount</span>
            <input
              type="text"
              inputMode="decimal"
              value={form.amount}
              onChange={update('amount')}
              placeholder="0.00"
              aria-label="Amount"
            />
          </label>

          <label className="field">
            <span>Category</span>
            <select value={form.category} onChange={update('category')} aria-label="Category">
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Date</span>
            <input type="date" value={form.date} onChange={update('date')} aria-label="Date" />
          </label>

          <button type="submit" className="btn btn--primary">
            Add expense
          </button>
        </form>
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      {summary.byCategory.length > 0 && (
        <section className="panel">
          <h2 className="panel__title">By category</h2>
          <ul className="bars">
            {summary.byCategory.map((row) => (
              <li key={row.category} className="bar">
                <span className="bar__label">{row.category}</span>
                <span className="bar__track">
                  <span
                    className="bar__fill"
                    style={{ width: `${maxCategory ? (row.amount / maxCategory) * 100 : 0}%` }}
                  />
                </span>
                <span className="bar__value">{formatCurrency(row.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel">
        <div className="list__head">
          <h2 className="panel__title">Expenses</h2>
          <div className="filters">
            <input
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search expenses"
            />
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
              <option value="all">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="empty">
            {summary.count === 0 ? 'No expenses yet. Add one above.' : 'No expenses match your filters.'}
          </p>
        ) : (
          <ul className="list">
            {visible.map((expense) => (
              <li key={expense.id} className="row">
                <span className="row__main">
                  <span className="row__desc">{expense.description}</span>
                  <span className="row__meta">
                    {expense.category} · {expense.date}
                  </span>
                </span>
                <span className="row__amount">{formatCurrency(expense.amount)}</span>
                <button
                  type="button"
                  className="row__delete"
                  onClick={() => remove(expense.id)}
                  aria-label={`Delete ${expense.description}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {visible.length > 0 && (
          <footer className="list__foot">
            <span>Showing {formatCurrency(visibleTotal)}</span>
            {summary.count > 0 && (
              <button type="button" className="btn btn--ghost" onClick={clear}>
                Clear all
              </button>
            )}
          </footer>
        )}
      </section>
    </main>
  );
}
