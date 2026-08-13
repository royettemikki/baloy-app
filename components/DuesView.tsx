'use client';
import { formatShortDate, formatFullDate } from '@/lib/formatDate';
import Link from 'next/link';

type Charge = {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Due' | 'Pending' | 'Paid' | 'Rejected' | 'Overdue';
  rejectionReason: string | null;
};

export default function DuesView({ charges, balance }: { charges: Charge[]; balance: number }) {
  const nextDue = charges.find((c) => c.status === 'Due');
  const pending = charges.find((c) => c.status === 'Pending');
  const rejected = charges.find((c) => c.status === 'Rejected');

  return (
    <div className="animate-fadeInUp">
      <h1 className="mb-3.5 text-xl font-medium">Dues</h1>

      <div className="mb-3.5 rounded-2xl bg-brand p-[18px]">
        <p className="mb-1 text-[12.5px] text-brand-soft">Current balance</p>
        <p className="mb-3.5 text-3xl font-medium text-white">₱{balance.toFixed(2)}</p>
        <div className="flex items-center justify-between">
          {rejected ? (
            <p className="text-[13px] text-white">Payment couldn't be verified</p>
          ) : nextDue ? (
            <div>
              <p className="text-[11.5px] text-brand-soft">Next charge</p>
              <p className="text-[13px] text-white">
                ₱{nextDue.amount.toFixed(2)} on {formatShortDate(nextDue.dueDate)}
              </p>
            </div>
          ) : pending ? (
            <p className="text-[13px] text-white">Payment pending confirmation</p>
          ) : (
            <p className="text-[13px] text-white">All caught up</p>
          )}
          {(nextDue || rejected) && (
            <Link href={`/dues/pay?charge=${(nextDue ?? rejected)!.id}`}>
              <button className="rounded-xl bg-white px-4 py-2 text-[13px] font-medium text-brand-strong">
                {rejected ? 'Try again' : 'Pay now'}
              </button>
            </Link>
          )}
        </div>
      </div>

      <p className="mb-2 text-sm font-medium text-ink-soft">History</p>

      {charges.map((c) => (
        <div key={c.id} className="border-t border-line py-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-0.5 text-[13.5px] font-medium">{c.description}</p>
              <p className="text-[11.5px] text-ink-muted">{formatFullDate(c.dueDate)}</p>
            </div>
            <div className="text-right">
              <p className="mb-0.5 text-[13.5px]">₱{c.amount.toFixed(2)}</p>
              <span
                className={`rounded-pill px-2 py-0.5 text-[10.5px] font-medium ${
                  c.status === 'Paid'
                    ? 'bg-brand-soft text-brand-strong'
                    : c.status === 'Pending'
                      ? 'bg-warning-soft text-warning'
                      : 'bg-danger-soft text-danger'
                }`}
              >
                {c.status}
              </span>
            </div>
          </div>
          {c.status === 'Rejected' && c.rejectionReason && (
            <p className="mt-1.5 text-xs text-danger">{c.rejectionReason}</p>
          )}
        </div>
      ))}
    </div>
  );
}
