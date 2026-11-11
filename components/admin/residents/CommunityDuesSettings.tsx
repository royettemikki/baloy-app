'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCommunityDuesAction } from '@/app/actions/admin';

export default function CommunityDuesSettings({
  mode,
  rate,
  overrideCount,
  missingAreaCount,
}: {
  mode: 'Fixed' | 'PerArea';
  rate: number;
  overrideCount: number;
  missingAreaCount: number;
}) {
  const [duesMode, setDuesMode] = useState<'Fixed' | 'PerArea'>(mode);
  const [duesRate, setDuesRate] = useState(String(rate));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await updateCommunityDuesAction({ mode: duesMode, rate: Number(duesRate) });
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage('Community rate saved and applied to every resident. Custom rate overrides were cleared.');
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl bg-brand-soft/60 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-strong">Community-wide billing</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">Default monthly dues</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-soft">
            Save one fixed rate or area-based rate for the whole community. Saving applies it to every property without a custom property rate.
          </p>
        </div>
        <div className="mt-2 rounded-xl bg-surface/70 px-3 py-2 text-xs text-ink-soft sm:mt-0">
          <span className="font-semibold text-ink">{overrideCount}</span> custom property rate{overrideCount === 1 ? '' : 's'} will be replaced
          {duesMode === 'PerArea' && <span className="block"><span className="font-semibold text-ink">{missingAreaCount}</span> propert{missingAreaCount === 1 ? 'y needs' : 'ies need'} lot area</span>}
        </div>
      </div>

      <form onSubmit={save} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(180px,0.8fr)_minmax(180px,1fr)_auto] sm:items-end">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-soft">Rate type</span>
          <select value={duesMode} onChange={(e) => setDuesMode(e.target.value as 'Fixed' | 'PerArea')} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink">
            <option value="Fixed">Fixed amount per month</option>
            <option value="PerArea">Rate per square meter</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-soft">{duesMode === 'Fixed' ? 'Monthly amount (₱)' : 'Monthly rate (₱ / m²)'}</span>
          <input type="number" min="0" step="0.01" required value={duesRate} onChange={(e) => setDuesRate(e.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink" />
        </label>
        <button type="submit" disabled={pending} className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-on-brand shadow-sm disabled:opacity-60">
          {pending ? 'Saving…' : 'Save community rate'}
        </button>
      </form>
      {duesMode === 'PerArea' && <p className="mt-2 text-[11px] text-ink-muted">Each property’s monthly amount is the rate multiplied by its lot area. Properties without an area set won’t be charged until it’s entered.</p>}
      {rate === 0 && <p className="mt-2 text-[11px] text-warning">No community rate is set yet, so properties without a custom override won’t receive an automatic monthly charge.</p>}
      {message && <p role="status" className="mt-3 text-xs font-medium text-brand-strong">{message}</p>}
      {error && <p role="alert" className="mt-3 text-xs font-medium text-danger">{error}</p>}
    </section>
  );
}
