'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateResidentAction, updateResidentDuesAction } from '@/app/actions/admin';
import { IconX } from '@/components/Icons';

export default function EditResidentPanel({
  homeowner,
  onClose,
}: {
  homeowner: {
    id: string;
    fullName: string;
    unit: string;
    email: string;
    lotAreaSqm: number | null;
    monthlyDuesMode: 'Fixed' | 'PerArea';
    monthlyDuesRate: number;
    duesRateOverride: boolean;
  };
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState(homeowner.fullName);
  const [unit, setUnit] = useState(homeowner.unit);
  const [email, setEmail] = useState(homeowner.email);
  const [duesMode, setDuesMode] = useState<'Fixed' | 'PerArea'>(homeowner.monthlyDuesMode);
  const [duesOverride, setDuesOverride] = useState(homeowner.duesRateOverride);
  const [duesRate, setDuesRate] = useState(String(homeowner.monthlyDuesRate));
  const [lotArea, setLotArea] = useState(homeowner.lotAreaSqm === null ? '' : String(homeowner.lotAreaSqm));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const residentResult = await updateResidentAction(homeowner.id, {
      fullName,
      unit,
      email,
    });
    if (residentResult.error) {
      setLoading(false);
      setError(residentResult.error);
      return;
    }
    const result = await updateResidentDuesAction(homeowner.id, {
      override: duesOverride,
      mode: duesMode,
      rate: Number(duesRate),
      lotAreaSqm: lotArea.trim() ? Number(lotArea) : null,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div
      className='fixed inset-0 z-50 flex justify-end bg-overlay animate-fadeIn'
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='w-full max-w-sm bg-surface h-full p-6 overflow-y-auto no-scrollbar animate-slideInRight'
      >
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-lg font-medium'>Edit resident</h2>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center'
          >
            <IconX width={14} height={14} className='text-ink-soft' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div>
            <label className='block text-[11px] text-ink-soft mb-1.5'>
              Full name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className='w-full border border-line rounded-lg px-3 py-2.5 text-sm'
            />
          </div>
          <div>
            <label className='block text-[11px] text-ink-soft mb-1.5'>
              Unit
            </label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              className='w-full border border-line rounded-lg px-3 py-2.5 text-sm'
            />
          </div>
          <div>
            <label className='block text-[11px] text-ink-soft mb-1.5'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full border border-line rounded-lg px-3 py-2.5 text-sm'
            />
          </div>
          <section className='mt-2 rounded-2xl bg-brand-soft/50 p-4'>
            <p className='text-sm font-semibold text-ink'>Monthly dues</p>
            <p className='mt-1 text-xs leading-relaxed text-ink-muted'>Use the community-wide rate or set a custom rate for this resident. Existing charges keep their original amount.</p>
            <div className='mt-3'>
              <label className='mb-1.5 block text-[11px] font-medium text-ink-soft'>Lot area (sq m)</label>
              <input type='number' min='0.01' step='0.01' value={lotArea} onChange={(e) => setLotArea(e.target.value)} required={duesMode === 'PerArea'} placeholder='Needed for area-based rates' className='w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink' />
            </div>
            <label className='mt-4 flex cursor-pointer items-start gap-2.5 text-xs text-ink-soft'>
              <input type='checkbox' checked={!duesOverride} onChange={(e) => setDuesOverride(!e.target.checked)} className='mt-0.5 accent-brand' />
              Use community default rate
            </label>
            {!duesOverride && <p className='mt-2 rounded-lg bg-surface px-3 py-2 text-xs text-ink-muted'>This resident follows the shared policy. Future monthly assessments will use its current rate.</p>}
            {duesOverride && <>
              <label className='mt-4 block text-[11px] font-medium text-ink-soft mb-1.5'>Billing method</label>
              <select value={duesMode} onChange={(e) => setDuesMode(e.target.value as 'Fixed' | 'PerArea')} className='w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink'>
                <option value='Fixed'>Fixed monthly amount</option>
                <option value='PerArea'>Rate per square meter</option>
              </select>
              <div className='mt-3'>
                <label className='mb-1.5 block text-[11px] font-medium text-ink-soft'>{duesMode === 'Fixed' ? 'Monthly amount (₱)' : 'Monthly rate (₱ / m²)'}</label>
                <input type='number' min='0' step='0.01' value={duesRate} onChange={(e) => setDuesRate(e.target.value)} required className='w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink' />
                <p className='mt-1.5 text-[11px] text-ink-muted'>A rate of zero skips automatic monthly charges for this resident.</p>
              </div>
            </>}
          </section>
          {error && <p className='text-danger text-xs'>{error}</p>}
          <button
            type='submit'
            disabled={loading}
            className='bg-brand text-on-brand text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-60'
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
