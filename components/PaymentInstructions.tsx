'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { claimPaymentAction } from '@/app/actions/dues';

type Method = 'gcash' | 'bank';

export default function PaymentInstructions({
  chargeId,
  description,
  amount,
}: {
  chargeId: number;
  description: string;
  amount: number;
}) {
  const [method, setMethod] = useState<Method>('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!referenceNumber.trim()) {
      setError('Please enter your reference or transaction number.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await claimPaymentAction(chargeId, referenceNumber);
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
      <div className='flex flex-col items-center text-center px-4 py-10'>
        <div className='w-14 h-14 rounded-full bg-warning-soft flex items-center justify-center mb-4'>
          <span className='text-2xl'>⏳</span>
        </div>
        <p className='text-lg font-medium mb-1.5'>Payment submitted</p>
        <p className='text-sm text-ink-soft leading-relaxed mb-6'>
          We've noted your payment for {description}. It'll show as pending
          until the board confirms it against their records.
        </p>
        <button
          onClick={() => router.push('/dues')}
          className='w-full bg-brand text-on-brand rounded-xl py-3.5 text-sm font-medium'
        >
          Back to Dues
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className='text-xs text-ink-muted mb-0.5'>Pay for</p>
      <h1 className='text-xl font-medium mb-1'>{description}</h1>
      <p className='text-2xl font-medium text-brand mb-5'>
        ₱{amount.toFixed(2)}
      </p>

      {/* GCash option */}
      <div className='border border-line rounded-2xl mb-2.5 overflow-hidden'>
        <button
          onClick={() => setMethod('gcash')}
          className='w-full flex items-center gap-3 p-4 text-left'
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              method === 'gcash'
                ? 'border-[5px] border-brand'
                : 'border border-line'
            }`}
          />
          <img
            src='/gcash-logo.png'
            alt='GCash'
            className='h-7 flex-shrink-0'
          />
          <span className='text-sm font-medium flex-1'>Pay via GCash</span>
        </button>

        {method === 'gcash' && (
          <div className='px-4 pb-4 animate-fadeInUp'>
            <div className='w-full aspect-square bg-surface-muted rounded-xl flex items-center justify-center mb-3 overflow-hidden'>
              <img
                src='/gcash-qr.png'
                alt='GCash QR code'
                className='w-full h-full object-contain'
              />
            </div>
            <a
              href='/gcash-qr.png'
              download='gcash-payment-qr.png'
              className='block text-center text-xs font-medium text-brand mb-3'
            >
              Download QR code
            </a>
            <p className='text-xs text-ink-soft'>
              GCash number: <span className='font-medium'>0917 000 0000</span>
            </p>
            <p className='text-xs text-ink-soft'>
              Account name:{' '}
              <span className='font-medium'>
                Makiling Hills - Woodlands HOA
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Bank transfer option */}
      <div className='border border-line rounded-2xl mb-5 overflow-hidden'>
        <button
          onClick={() => setMethod('bank')}
          className='w-full flex items-center gap-3 p-4 text-left'
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              method === 'bank'
                ? 'border-[5px] border-brand'
                : 'border border-line'
            }`}
          />
          <img src='/bdo-logo.png' alt='BDO' className='h-7 flex-shrink-0' />
          <span className='text-sm font-medium flex-1'>
            Pay via bank transfer
          </span>
        </button>

        {method === 'bank' && (
          <div className='px-4 pb-4 animate-fadeInUp'>
            <p className='text-xs text-ink-soft'>
              Bank: <span className='font-medium'>BDO</span>
            </p>
            <p className='text-xs text-ink-soft'>
              Account name:{' '}
              <span className='font-medium'>
                Makiling Hills - Woodlands HOA
              </span>
            </p>
            <p className='text-xs text-ink-soft'>
              Account number:{' '}
              <span className='font-medium'>0000 0000 0000</span>
            </p>
          </div>
        )}
      </div>

      {error && <p className='text-danger text-xs text-center mb-3'>{error}</p>}

      <label className='block text-[11.5px] text-ink-soft mb-1.5'>
        Reference or transaction number <span className='text-danger'>*</span>
      </label>
      <input
        value={referenceNumber}
        onChange={(e) => setReferenceNumber(e.target.value)}
        placeholder='e.g. GCash reference number'
        required
        className='w-full border border-line rounded-xl px-3.5 py-2.5 text-sm mb-4 bg-surface'
      />

      <button
        onClick={handleSubmit}
        disabled={pending}
        className='w-full bg-brand disabled:opacity-60 text-on-brand rounded-xl py-3.5 text-sm font-medium'
      >
        {pending ? 'Submitting…' : "I've sent my payment"}
      </button>
    </div>
  );
}
