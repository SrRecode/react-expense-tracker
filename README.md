# React Expense Tracker

A small personal-finance app built with React hooks. Add expenses with an amount,
category and date, watch totals and a category breakdown update live, then filter
or delete entries. Everything is persisted to `localStorage`.

All the arithmetic and filtering lives in framework-free helpers so it can be
tested without a browser, and the UI is covered with
[Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## Features

- Add an expense (description, amount, category, date) with validation
- Grand total and expense count in the header
- "By category" breakdown with proportional bars
- Search by description and filter by category at the same time
- Delete a single expense or clear everything
- Persistence via `localStorage`, with an injectable storage object for tests

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm test         # run the test suite once
npm run build    # production build into dist/
```

## Project layout

```
src/lib/expenses.js      Pure helpers: normalizeAmount, makeExpense, addExpense,
                         removeExpense, total, totalsByCategory, filterExpenses,
                         sortByDate, formatCurrency
src/hooks/useExpenses.js State + persistence + filters for the expense list
src/App.jsx              Form, summary, category bars and the list
src/styles.css           Styling
vite.config.js           Vite + Vitest configuration
```

### Design notes

- Amounts are normalized to positive numbers rounded to two decimals
  (`normalizeAmount`); invalid input is rejected rather than stored.
- The store is a plain array of `{ id, description, amount, category, date }`
  objects. `date` is an ISO `YYYY-MM-DD` string, so sorting is a lexicographic
  string compare.
- `totalsByCategory` returns categories sorted by spend, descending, which the
  UI turns into bars sized relative to the largest category.
- `useExpenses` accepts a `storage` argument (defaults to `localStorage`) so the
  component tests can run against an in-memory store.

## Tests

```bash
npm test
```

Covers amount normalization, expense creation, add/remove, totals and floats
(`0.1 + 0.2`), category grouping, filtering, sorting without mutation, currency
formatting, and the full component flow (add, validation, filter, delete,
breakdown, persistence and clear-all).

## License

MIT
