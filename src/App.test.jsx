import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { EXPENSES_STORAGE_KEY } from './hooks/useExpenses.js';

function memoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (i) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
}

let storage;

beforeEach(() => {
  storage = memoryStorage();
});

async function addExpense(user, { description, amount, category }) {
  if (description != null) {
    await user.type(screen.getByLabelText('Description'), description);
  }
  if (amount != null) {
    await user.type(screen.getByLabelText('Amount'), amount);
  }
  if (category != null) {
    await user.selectOptions(screen.getByLabelText('Category'), category);
  }
  await user.click(screen.getByRole('button', { name: 'Add expense' }));
}

describe('App', () => {
  it('starts empty', () => {
    render(<App storage={storage} />);
    expect(screen.getByRole('heading', { name: 'Expense Tracker' })).toBeInTheDocument();
    expect(screen.getByText(/across 0 expenses/)).toBeInTheDocument();
    expect(screen.getByText(/No expenses yet/)).toBeInTheDocument();
  });

  it('adds an expense and updates the total', async () => {
    const user = userEvent.setup();
    render(<App storage={storage} />);

    await addExpense(user, { description: 'Coffee', amount: '4.50', category: 'Food' });

    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.getByText(/across 1 expense$/)).toBeInTheDocument();
    expect(screen.getAllByText('$4.50').length).toBeGreaterThanOrEqual(2); // row + total
  });

  it('clears the description and amount after adding', async () => {
    const user = userEvent.setup();
    render(<App storage={storage} />);

    await addExpense(user, { description: 'Coffee', amount: '4.50' });

    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByLabelText('Amount')).toHaveValue('');
  });

  it('rejects an invalid amount with an alert and adds nothing', async () => {
    const user = userEvent.setup();
    render(<App storage={storage} />);

    await addExpense(user, { description: 'Bad', amount: 'abc' });

    expect(screen.getByRole('alert')).toHaveTextContent(/positive amount/);
    expect(screen.getByText(/across 0 expenses/)).toBeInTheDocument();
  });

  it('filters by category and search query', async () => {
    const user = userEvent.setup();
    render(<App storage={storage} />);

    await addExpense(user, { description: 'Coffee', amount: '4', category: 'Food' });
    await addExpense(user, { description: 'Bus pass', amount: '30', category: 'Transport' });

    await user.selectOptions(screen.getByLabelText('Filter by category'), 'Transport');
    expect(screen.queryByText('Coffee')).not.toBeInTheDocument();
    expect(screen.getByText('Bus pass')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Filter by category'), 'all');
    await user.type(screen.getByLabelText('Search expenses'), 'cof');
    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.queryByText('Bus pass')).not.toBeInTheDocument();
  });

  it('deletes an expense and updates the total', async () => {
    const user = userEvent.setup();
    render(<App storage={storage} />);

    await addExpense(user, { description: 'Coffee', amount: '4', category: 'Food' });
    await user.click(screen.getByRole('button', { name: 'Delete Coffee' }));

    expect(screen.queryByText('Coffee')).not.toBeInTheDocument();
    expect(screen.getByText(/across 0 expenses/)).toBeInTheDocument();
  });

  it('shows a category breakdown bar', async () => {
    const user = userEvent.setup();
    render(<App storage={storage} />);

    await addExpense(user, { description: 'Coffee', amount: '4', category: 'Food' });

    const heading = screen.getByRole('heading', { name: 'By category' });
    const section = heading.closest('section');
    expect(within(section).getByText('Food')).toBeInTheDocument();
  });

  it('persists expenses to the provided storage', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App storage={storage} />);
    await addExpense(user, { description: 'Coffee', amount: '4', category: 'Food' });
    unmount();

    expect(JSON.parse(storage.getItem(EXPENSES_STORAGE_KEY))).toHaveLength(1);

    render(<App storage={storage} />);
    expect(screen.getByText('Coffee')).toBeInTheDocument();
  });

  it('clears all expenses', async () => {
    const user = userEvent.setup();
    render(<App storage={storage} />);

    await addExpense(user, { description: 'Coffee', amount: '4', category: 'Food' });
    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(screen.getByText(/No expenses yet/)).toBeInTheDocument();
  });
});
