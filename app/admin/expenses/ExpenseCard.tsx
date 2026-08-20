import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from '@/constants/expenseCategories';
import { Expense } from '@/types/expense';
import ExpenseActionsMenu from './ExpenseActionsMenu';
import { formatFullDate } from '@/lib/formatDate';

export default function ExpenseCard({ expense }: { expense: Expense }) {
  const style = EXPENSE_CATEGORIES[expense.category];

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.bg} ${style.fg}`}
        >
          {style.icon}
        </div>
        <ExpenseActionsMenu expense={expense} />
      </div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
        {EXPENSE_CATEGORY_LABELS[expense.category]}
      </p>
      <p className="mb-1.5 text-sm font-medium">{expense.description}</p>
      <p className="mb-2 text-2xl font-medium">₱{expense.amount.toFixed(2)}</p>
      <p className="text-xs text-ink-muted">
        Paid to {expense.paidTo} · {formatFullDate(expense.date)}
      </p>
    </div>
  );
}
