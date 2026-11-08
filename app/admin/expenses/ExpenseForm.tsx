'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createExpenseAction, updateExpenseAction } from '@/app/actions/expenses';
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory } from '@/constants/expenseCategories';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Initial = {
  id?: number;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidTo: string;
  date: string;
};

export default function ExpenseForm({
  initial,
  onDone,
}: {
  initial?: Initial;
  onDone: () => void;
}) {
  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? 'Maintenance');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [paidTo, setPaidTo] = useState(initial?.paidTo ?? '');
  const [date, setDate] = useState(
    initial ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = { category, description, amount: parseFloat(amount), paidTo, date };
    const result = initial?.id
      ? await updateExpenseAction(initial.id, data)
      : await createExpenseAction(data);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        placeholder="e.g. Monthly water bill"
      />
      <Input
        label="Paid to"
        value={paidTo}
        onChange={(e) => setPaidTo(e.target.value)}
        required
        placeholder="e.g. Manila Water"
      />
      <Input
        label="Amount (₱)"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? 'Saving…' : initial?.id ? 'Save changes' : 'Log expense'}
      </Button>
    </form>
  );
}
