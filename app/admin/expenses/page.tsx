import { prisma } from '@/lib/prisma';
import ExpensesList from '@/app/admin/expenses/ExpensesList';
import NewExpenseButton from '@/app/admin/expenses/NewExpenseButton';

export default async function AdminExpensesPage() {
  const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });

  const serialized = expenses.map((e) => ({
    id: e.id,
    category: e.category,
    description: e.description,
    amount: Number(e.amount),
    paidTo: e.paidTo,
    date: e.date.toISOString(),
  }));

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalThisMonth = serialized
    .filter((e) => new Date(e.date) >= startOfMonth)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalAllTime = serialized.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">Log and track everything the HOA spends.</p>
        <NewExpenseButton />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="mb-1 text-xs text-ink-muted">This month</p>
          <p className="text-3xl font-medium">₱{totalThisMonth.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="mb-1 text-xs text-ink-muted">All time</p>
          <p className="text-3xl font-medium">₱{totalAllTime.toFixed(2)}</p>
        </div>
      </div>

      <ExpensesList expenses={serialized} />
    </div>
  );
}
