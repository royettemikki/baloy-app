'use client';

import { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import Button from '@/components/ui/Button';
import { IconX } from '@/components/Icons';

export default function NewExpenseButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        + Log expense
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex animate-fadeIn justify-end bg-black/30"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="no-scrollbar h-full w-full max-w-sm animate-slideInRight overflow-y-auto bg-surface p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-medium">Log expense</h2>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted"
              >
                <IconX width={14} height={14} className="text-ink-soft" />
              </button>
            </div>
            <ExpenseForm onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
