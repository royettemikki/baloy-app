'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createExpenseRequestAction } from '@/app/actions/expenseRequests';
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory } from '@/constants/expenseCategories';

type Membership = { positionId: number; positionTitle: string };

export default function ExpenseRequestForm({ memberships }: { memberships: Membership[] }) {
  const [positionId, setPositionId] = useState(memberships[0].positionId);
  const [category, setCategory] = useState<ExpenseCategory>('Maintenance');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [justification, setJustification] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createExpenseRequestAction({
      positionId,
      category,
      description,
      amount: parseFloat(amount),
      justification,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
    setDescription('');
    setAmount('');
    setJustification('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-surface-muted p-4">
      {submitted && (
        <p className="rounded-lg bg-brand-soft px-3 py-2 text-xs text-brand-strong">
          Request submitted — the board will review it.
        </p>
      )}

      {memberships.length > 1 && (
        <div>
          <label className="mb-1.5 block text-[11px] text-ink-soft">Requesting as</label>
          <select
            value={positionId}
            onChange={(e) => setPositionId(Number(e.target.value))}
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
          >
            {memberships.map((m) => (
              <option key={m.positionId} value={m.positionId}>
                {m.positionTitle}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-[11px] text-ink-soft">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
        >
          {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] text-ink-soft">What's this for</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="e.g. Replace broken pool gate lock"
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] text-ink-soft">Estimated amount (₱)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] text-ink-soft">Why is this needed</label>
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          required
          rows={3}
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
        />
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-on-brand disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'Submit request'}
      </button>
    </form>
  );
}
