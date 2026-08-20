'use client';

import ExpenseForm from './ExpenseForm';
import { IconX } from '@/components/Icons';
import { Expense } from '@/types/expense';

export default function EditExpensePanel({
  expense,
  onClose,
}: {
  expense: Expense;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fadeIn justify-end bg-black/30"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="no-scrollbar h-full w-full max-w-sm animate-slideInRight overflow-y-auto bg-surface p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium">Edit expense</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted"
          >
            <IconX width={14} height={14} className="text-ink-soft" />
          </button>
        </div>
        <ExpenseForm initial={expense} onDone={onClose} />
      </div>
    </div>
  );
}
