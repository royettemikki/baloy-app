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
    propertyNeedsReview: boolean;
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
  const [lotArea, setLotArea] = useState(
    homeowner.lotAreaSqm === null ? '' : String(homeowner.lotAreaSqm),
  );
  const [reviewedProperty, setReviewedProperty] = useState(false);
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
    const result = residentResult.propertyChanged
      ? { success: true as const }
      : await updateResidentDuesAction(homeowner.id, {
          override: duesOverride,
          mode: duesMode,
          rate: Number(duesRate),
          lotAreaSqm: lotArea.trim() ? Number(lotArea) : null,
          reviewedProperty,
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
      className="fixed inset-0 z-50 flex animate-fadeIn justify-end bg-overlay"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="no-scrollbar h-full w-full max-w-sm animate-slideInRight overflow-y-auto bg-surface p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium">Edit resident</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted"
          >
            <IconX width={14} height={14} className="text-ink-soft" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[11px] text-ink-soft">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] text-ink-soft">Unit</label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] text-ink-soft">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
            />
          </div>
          <section className="bg-brand-soft/50 mt-2 rounded-2xl p-4">
            <p className="text-sm font-semibold text-ink">Monthly dues</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Dues settings and history are shared by everyone linked to this property. Existing
              charges keep their original amount.
            </p>
            <div className="mt-3">
              <label className="mb-1.5 block text-[11px] font-medium text-ink-soft">
                Lot area (sq m)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={lotArea}
                onChange={(e) => setLotArea(e.target.value)}
                required={duesMode === 'PerArea'}
                placeholder="Needed for area-based rates"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink"
              />
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={!duesOverride}
                onChange={(e) => setDuesOverride(!e.target.checked)}
                className="mt-0.5 accent-brand"
              />
              Use community default rate
            </label>
            {!duesOverride && (
              <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-xs text-ink-muted">
                This resident follows the shared policy. Future monthly assessments will use its
                current rate.
              </p>
            )}
            {duesOverride && (
              <>
                <label className="mb-1.5 mt-4 block text-[11px] font-medium text-ink-soft">
                  Billing method
                </label>
                <select
                  value={duesMode}
                  onChange={(e) => setDuesMode(e.target.value as 'Fixed' | 'PerArea')}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink"
                >
                  <option value="Fixed">Fixed monthly amount</option>
                  <option value="PerArea">Rate per square meter</option>
                </select>
                <div className="mt-3">
                  <label className="mb-1.5 block text-[11px] font-medium text-ink-soft">
                    {duesMode === 'Fixed' ? 'Monthly amount (₱)' : 'Monthly rate (₱ / m²)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={duesRate}
                    onChange={(e) => setDuesRate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink"
                  />
                  <p className="mt-1.5 text-[11px] text-ink-muted">
                    A rate of zero skips automatic monthly charges for this resident.
                  </p>
                </div>
              </>
            )}
            {homeowner.propertyNeedsReview && (
              <label className="border-warning/20 bg-warning-soft/40 mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={reviewedProperty}
                  onChange={(e) => setReviewedProperty(e.target.checked)}
                  className="mt-0.5 accent-brand"
                />
                <span>
                  I reviewed and confirmed this property&apos;s lot area and dues settings.
                </span>
              </label>
            )}
          </section>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-on-brand disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
