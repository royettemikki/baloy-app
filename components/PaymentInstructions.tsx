'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { claimPaymentAction } from '@/app/actions/dues';

type Method = 'gcash' | 'bank';

export default function PaymentInstructions({ remainingAmount }: { remainingAmount: number }) {
  const [method, setMethod] = useState<Method>('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [amountPaid, setAmountPaid] = useState(remainingAmount.toFixed(2));
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!referenceNumber.trim()) {
      setError('Please enter your reference or transaction number.');
      return;
    }
    const parsedAmount = parseFloat(amountPaid);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await claimPaymentAction(referenceNumber, parsedAmount);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
      router.refresh();
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center px-4 py-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft">
          <span className="text-2xl">⏳</span>
        </div>
        <p className="mb-1.5 text-lg font-medium">Payment submitted</p>
        <p className="mb-6 text-sm leading-relaxed text-ink-soft">
          We've noted your payment. It'll show as pending until the board confirms it against their
          records.
        </p>
        <button
          onClick={() => router.push('/dues')}
          className="w-full rounded-xl bg-brand py-3.5 text-sm font-medium text-on-brand"
        >
          Back to Dues
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-0.5 text-xs text-ink-muted">Pay your balance</p>
      <h1 className="mb-1 text-xl font-medium">Millbrook Commons dues</h1>
      <p className="mb-5 text-2xl font-medium text-brand">₱{remainingAmount.toFixed(2)} total</p>

      <div className="mb-2.5 overflow-hidden rounded-2xl border border-line">
        <button
          onClick={() => setMethod('gcash')}
          className="flex w-full items-center gap-3 p-4 text-left"
        >
          <div
            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${method === 'gcash' ? 'border-[5px] border-brand' : 'border border-line'}`}
          />
          <img src="/gcash-logo.png" alt="GCash" className="h-5 flex-shrink-0" />
          <span className="flex-1 text-sm font-medium">Pay via GCash</span>
        </button>
        {method === 'gcash' && (
          <div className="animate-fadeInUp px-4 pb-4">
            <div className="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
              <img
                src="/gcash-qr.png"
                alt="GCash QR code"
                className="h-full w-full object-contain"
              />
            </div>
            <a
              href="/gcash-qr.png"
              download="gcash-payment-qr.png"
              className="mb-3 block text-center text-xs font-medium text-brand"
            >
              Download QR code
            </a>
            <p className="text-xs text-ink-soft">
              GCash number: <span className="font-medium">0917 000 0000</span>
            </p>
            <p className="text-xs text-ink-soft">
              Account name: <span className="font-medium">Makiling Hills - Woodlands HOA</span>
            </p>
          </div>
        )}
      </div>

      <div className="mb-5 overflow-hidden rounded-2xl border border-line">
        <button
          onClick={() => setMethod('bank')}
          className="flex w-full items-center gap-3 p-4 text-left"
        >
          <div
            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${method === 'bank' ? 'border-[5px] border-brand' : 'border border-line'}`}
          />
          <img src="/bdo-logo.png" alt="BDO" className="h-5 flex-shrink-0" />
          <span className="flex-1 text-sm font-medium">Pay via bank transfer</span>
        </button>
        {method === 'bank' && (
          <div className="animate-fadeInUp px-4 pb-4">
            <p className="text-xs text-ink-soft">
              Bank: <span className="font-medium">BDO</span>
            </p>
            <p className="text-xs text-ink-soft">
              Account name: <span className="font-medium">Makiling Hills - Woodlands HOA</span>
            </p>
            <p className="text-xs text-ink-soft">
              Account number: <span className="font-medium">0000 0000 0000</span>
            </p>
          </div>
        )}
      </div>

      {error && <p className="mb-3 text-center text-xs text-danger">{error}</p>}

      <label className="mb-1.5 block text-[11.5px] text-ink-soft">
        Amount you sent <span className="text-danger">*</span>
      </label>
      <input
        type="number"
        step="0.01"
        value={amountPaid}
        onChange={(e) => setAmountPaid(e.target.value)}
        className="mb-1 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
      />
      <p className="mb-4 text-[11px] text-ink-muted">
        Sent a different amount than {`₱${remainingAmount.toFixed(2)}`}? Enter exactly what you sent
        — we'll sort out the difference.
      </p>

      <label className="mb-1.5 block text-[11.5px] text-ink-soft">
        Reference or transaction number <span className="text-danger">*</span>
      </label>
      <input
        value={referenceNumber}
        onChange={(e) => setReferenceNumber(e.target.value)}
        placeholder="e.g. GCash reference number"
        className="mb-4 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
      />

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="w-full rounded-xl bg-brand py-3.5 text-sm font-medium text-on-brand disabled:opacity-60"
      >
        {pending ? 'Submitting…' : "I've sent my payment"}
      </button>
    </div>
  );
}
