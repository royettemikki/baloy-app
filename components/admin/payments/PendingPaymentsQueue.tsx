'use client';

import { useState } from 'react';
import PaymentRow from './PaymentRow';

type PendingPayment = {
  id: number;
  amountPaid: number;
  referenceNumber: string | null;
  submittedAt: string;
  homeowner: { fullName: string; unit: string; email: string };
  duesCharge: { description: string };
};

export default function PendingPaymentsQueue({ payments }: { payments: PendingPayment[] }) {
  const [query, setQuery] = useState('');

  if (payments.length === 0) {
    return (
      <div className="mb-8 rounded-2xl border border-line bg-surface p-8 text-center">
        <p className="text-sm text-ink-muted">Nothing waiting on you right now.</p>
      </div>
    );
  }

  const filtered = payments.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.homeowner.fullName.toLowerCase().includes(q) ||
      p.homeowner.unit.toLowerCase().includes(q) ||
      p.homeowner.email.toLowerCase().includes(q) ||
      (p.referenceNumber ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="border-b border-line p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by resident, unit, or reference number…"
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-2 text-sm"
        />
      </div>

      <div className="p-4">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">No matching payments.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PaymentRow key={p.id} payment={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
