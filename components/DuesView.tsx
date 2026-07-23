'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { payDueAction } from '@/app/actions';

type Charge = {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Due' | 'Paid' | 'Overdue';
};

export default function DuesView({
  charges,
  balance,
}: {
  charges: Charge[];
  balance: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const nextDue = charges.find((c) => c.status !== 'Paid');

  function handlePay() {
    if (!nextDue) return;
    setError(null);
    startTransition(async () => {
      const result = await payDueAction(nextDue.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className='text-xl font-medium mb-3.5'>Dues</h1>

      {error && <p className='text-danger text-xs text-center mb-3'>{error}</p>}

      <div className='bg-brand rounded-2xl p-[18px] mb-3.5'>
        <p className='text-[12.5px] text-brand-soft mb-1'>Current balance</p>
        <p className='text-3xl font-medium text-white mb-3.5'>
          ₱{balance.toFixed(2)}
        </p>
        <div className='flex items-center justify-between'>
          {nextDue ? (
            <div>
              <p className='text-[11.5px] text-brand-soft'>Next charge</p>
              <p className='text-[13px] text-white'>
                ₱{nextDue.amount.toFixed(2)} on{' '}
                {new Date(nextDue.dueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          ) : (
            <p className='text-[13px] text-white'>All caught up</p>
          )}
          <button
            onClick={handlePay}
            disabled={!nextDue || pending}
            className='bg-white disabled:opacity-60 text-brand-strong text-[13px] font-medium px-4 py-2 rounded-xl'
          >
            {pending ? 'Processing…' : 'Pay now'}
          </button>
        </div>
      </div>

      <p className='text-sm font-medium text-ink-soft mb-2'>History</p>

      {charges.map((c) => (
        <div
          key={c.id}
          className='flex items-center justify-between py-2.5 border-t border-line'
        >
          <div>
            <p className='text-[13.5px] font-medium mb-0.5'>{c.description}</p>
            <p className='text-[11.5px] text-ink-muted'>
              {new Date(c.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className='text-right'>
            <p className='text-[13.5px] mb-0.5'>₱{c.amount.toFixed(2)}</p>
            <span
              className={`text-[10.5px] font-medium px-2 py-0.5 rounded-pill ${
                c.status === 'Paid'
                  ? 'text-brand-strong bg-brand-soft'
                  : 'text-danger bg-danger-soft'
              }`}
            >
              {c.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
