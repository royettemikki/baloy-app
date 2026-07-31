'use client';

import Link from 'next/link';

type Charge = {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Due' | 'Pending' | 'Paid' | 'Rejected' | 'Overdue';
  rejectionReason: string | null;
};

export default function DuesView({
  charges,
  balance,
}: {
  charges: Charge[];
  balance: number;
}) {
  const nextDue = charges.find((c) => c.status === 'Due');
  const pending = charges.find((c) => c.status === 'Pending');
  const rejected = charges.find((c) => c.status === 'Rejected');

  return (
    <div className='animate-fadeInUp'>
      <h1 className='text-xl font-medium mb-3.5'>Dues</h1>

      <div className='bg-brand rounded-2xl p-[18px] mb-3.5'>
        <p className='text-[12.5px] text-brand-soft mb-1'>Current balance</p>
        <p className='text-3xl font-medium text-white mb-3.5'>
          ₱{balance.toFixed(2)}
        </p>
        <div className='flex items-center justify-between'>
          {rejected ? (
            <p className='text-[13px] text-white'>
              Payment couldn't be verified
            </p>
          ) : nextDue ? (
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
          ) : pending ? (
            <p className='text-[13px] text-white'>
              Payment pending confirmation
            </p>
          ) : (
            <p className='text-[13px] text-white'>All caught up</p>
          )}
          {(nextDue || rejected) && (
            <Link href={`/dues/pay?charge=${(nextDue ?? rejected)!.id}`}>
              <button className='bg-white text-brand-strong text-[13px] font-medium px-4 py-2 rounded-xl'>
                {rejected ? 'Try again' : 'Pay now'}
              </button>
            </Link>
          )}
        </div>
      </div>

      <p className='text-sm font-medium text-ink-soft mb-2'>History</p>

      {charges.map((c) => (
        <div key={c.id} className='py-2.5 border-t border-line'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-[13.5px] font-medium mb-0.5'>
                {c.description}
              </p>
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
                    : c.status === 'Pending'
                      ? 'text-warning bg-warning-soft'
                      : 'text-danger bg-danger-soft'
                }`}
              >
                {c.status}
              </span>
            </div>
          </div>
          {c.status === 'Rejected' && c.rejectionReason && (
            <p className='text-xs text-danger mt-1.5'>{c.rejectionReason}</p>
          )}
        </div>
      ))}
    </div>
  );
}
