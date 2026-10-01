'use client';

import { useState } from 'react';
import ExpenseCard from './ExpenseCard';
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory } from '@/constants/expenseCategories';
import { Expense } from '@/types/expense';

export default function ExpensesList({ expenses }: { expenses: Expense[] }) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'All'>('All');

  const filtered = expenses.filter((e) => {
    const matchesQuery =
      e.description.toLowerCase().includes(query.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search expenses…"
        className="mb-4 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm shadow-sm"
      />

      <div className="mb-6 flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategoryFilter('All')}
          className={`whitespace-nowrap rounded-pill px-3 py-1.5 text-xs font-medium ${categoryFilter === 'All' ? 'bg-brand text-on-brand' : 'bg-surface-muted text-ink-soft'}`}
        >
          All
        </button>
        {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategoryFilter(key as ExpenseCategory)}
            className={`whitespace-nowrap rounded-pill px-3 py-1.5 text-xs font-medium ${categoryFilter === key ? 'bg-brand text-on-brand' : 'bg-surface-muted text-ink-soft'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">No matching expenses.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <ExpenseCard key={e.id} expense={e} />
          ))}
        </div>
      )}
    </div>
  );
}
