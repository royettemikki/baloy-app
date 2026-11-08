'use client';

import { useState } from 'react';
import ExpenseCard from './ExpenseCard';
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory } from '@/constants/expenseCategories';
import { Expense } from '@/types/expense';

export default function ExpensesList({ expenses }: { expenses: Expense[] }) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'All'>('All');

  const filtered = expenses.filter((expense) => {
    const search = query.toLowerCase();
    const matchesQuery = expense.description.toLowerCase().includes(search) || expense.paidTo.toLowerCase().includes(search);
    return matchesQuery && (categoryFilter === 'All' || expense.category === categoryFilter);
  });

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-surface p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value as ExpenseCategory | 'All')}
          aria-label="Filter expenses by category"
          className="w-full rounded-xl bg-surface-muted px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30 sm:max-w-[220px]"
        >
          <option value="All">All categories</option>
          {Object.entries(EXPENSE_CATEGORY_LABELS).map(([category, label]) => (
            <option key={category} value={category}>{label}</option>
          ))}
        </select>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search expenses"
          aria-label="Search expenses by description or recipient"
          className="w-full rounded-xl bg-surface-muted px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-muted focus:ring-2 focus:ring-brand/30 sm:max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-surface px-6 py-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-ink">No expenses found</p>
          <p className="mt-1 text-xs text-ink-muted">Try another search or category filter.</p>
          {(query || categoryFilter !== 'All') && (
            <button onClick={() => { setQuery(''); setCategoryFilter('All'); }} className="mt-4 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-on-brand">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((expense) => <ExpenseCard key={expense.id} expense={expense} />)}
        </div>
      )}
    </div>
  );
}
