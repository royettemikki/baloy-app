'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setElectionProxyAction } from '@/app/actions/elections';

type ProxyAccount = { id: string; fullName: string };

export default function ProxyAssignmentForm({
  electionId,
  activeAccounts,
  currentProxyId,
  onSaved,
  onCancel,
}: {
  electionId: number;
  activeAccounts: ProxyAccount[];
  currentProxyId: string | null;
  onSaved: (proxyId: string | null) => void;
  onCancel?: () => void;
}) {
  const [proxyId, setProxyId] = useState(currentProxyId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setProxyId(currentProxyId ?? '');
  }, [currentProxyId]);

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await setElectionProxyAction(electionId, proxyId || null);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved(proxyId || null);
      router.refresh();
    });
  }

  return (
    <div className="mb-4 rounded-2xl border border-line bg-surface p-4">
      <label htmlFor="election-proxy" className="block text-xs font-semibold text-ink">
        {currentProxyId ? 'Change or remove your proxy' : 'Choose a property member'}
      </label>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
        {currentProxyId
          ? 'Your proxy can submit this ballot. To vote yourself instead, select the first option and save; the ballot will then become available.'
          : 'The selected member will be authorized to submit your ballot. You can change or remove the assignment until a ballot is submitted.'}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <select
          id="election-proxy"
          value={proxyId}
          onChange={(event) => setProxyId(event.target.value)}
          className="min-h-10 flex-1 rounded-xl border border-line bg-surface px-3 text-sm"
        >
          <option value="">Remove proxy — I will vote myself</option>
          {activeAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.fullName}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="min-h-10 rounded-xl border border-line px-4 text-xs font-semibold text-ink-soft disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={
              pending || proxyId === (currentProxyId ?? '') || (!currentProxyId && !proxyId)
            }
            className="min-h-10 flex-1 rounded-xl bg-brand px-4 text-xs font-semibold text-on-brand disabled:opacity-50"
          >
            {pending ? 'Saving…' : proxyId ? 'Confirm proxy' : 'Remove proxy'}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
