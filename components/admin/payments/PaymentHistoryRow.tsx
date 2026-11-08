type ResolvedPayment = {
  id: number;
  amountPaid: number;
  status: 'Confirmed' | 'Rejected';
  rejectionReason: string | null;
  allocationSummary: string | null;
  submittedAt: string;
  homeowner: { fullName: string; unit: string };
};

export default function PaymentHistoryRow({ payment }: { payment: ResolvedPayment }) {
  const detail =
    payment.status === 'Confirmed'
      ? payment.allocationSummary
      : payment.status === 'Rejected'
        ? payment.rejectionReason
        : null;

  return (
    <div className="flex items-center justify-between border-t border-line py-3 first:border-0">
      <div>
        <p className="text-sm font-medium">{payment.homeowner.fullName}</p>
        <p className="text-xs text-ink-muted">
          Unit {payment.homeowner.unit}
          {detail ? ` — ${detail}` : ''}
        </p>
      </div>
      <div className="ml-3 flex-shrink-0 text-right">
        <p className="text-sm">₱{payment.amountPaid.toFixed(2)}</p>
        <span
          className={`rounded-pill px-2 py-0.5 text-[10.5px] font-medium ${
            payment.status === 'Confirmed'
              ? 'bg-brand-soft text-brand-strong'
              : 'bg-danger-soft text-danger'
          }`}
        >
          {payment.status}
        </span>
      </div>
    </div>
  );
}
