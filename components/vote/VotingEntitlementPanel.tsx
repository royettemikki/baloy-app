'use client';

import { useState } from 'react';
import type { Election } from '@/types/candidate';
import ProxyAssignmentForm from '@/components/vote/ProxyAssignmentForm';
import VoteWizard from '@/components/vote/VoteWizard';

type ProxyAccount = { id: string; fullName: string };

export default function VotingEntitlementPanel({
  election,
  voterId,
  activeAccounts,
  currentProxyId,
  canAssignProxy,
  proxyName,
}: {
  election: Election;
  voterId: number;
  activeAccounts: ProxyAccount[];
  currentProxyId: string | null;
  canAssignProxy: boolean;
  proxyName: string | null;
}) {
  const [mode, setMode] = useState<'choose' | 'self' | 'proxy'>(() =>
    !canAssignProxy ? 'self' : currentProxyId ? 'proxy' : 'choose',
  );

  return (
    <>
      {canAssignProxy && mode === 'choose' && (
        <section className="mb-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">How would you like to vote?</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Choose one option. Your ballot stays closed while you assign a proxy.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode('self')}
              className="rounded-xl bg-brand px-4 py-3 text-left text-sm font-semibold text-on-brand transition hover:brightness-95"
            >
              I’ll vote myself
              <span className="mt-1 block text-xs font-normal text-on-brand-muted">
                Review candidates and submit your ballot
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode('proxy')}
              disabled={activeAccounts.length === 0}
              className="rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm font-semibold text-ink transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Assign a proxy
              <span className="mt-1 block text-xs font-normal text-ink-muted">
                {activeAccounts.length > 0
                  ? 'Authorize a member of your property to vote'
                  : 'No other active property members are available'}
              </span>
            </button>
          </div>
        </section>
      )}
      {canAssignProxy && mode === 'proxy' && (
        <div className="border-warning/30 bg-warning-soft/40 mb-4 rounded-2xl border p-4">
          <h2 className="text-sm font-semibold text-ink">
            {currentProxyId ? 'Proxy assigned' : 'Assign your proxy'}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {currentProxyId
              ? `${proxyName ?? 'Your selected proxy'} is authorized to submit this ballot. You cannot vote yourself unless you remove this assignment first.`
              : 'While you assign a proxy, candidate selection and ballot submission are unavailable.'}
          </p>
        </div>
      )}
      {canAssignProxy && mode === 'proxy' && (
        <ProxyAssignmentForm
          electionId={election.id}
          activeAccounts={activeAccounts}
          currentProxyId={currentProxyId}
          onSaved={(nextProxyId) => {
            if (!nextProxyId) setMode('choose');
          }}
          onCancel={!currentProxyId ? () => setMode('choose') : undefined}
        />
      )}
      {mode === 'self' && (
        <VoteWizard
          key={voterId}
          election={election}
          votedPositionIds={[]}
          voterId={voterId}
          onChooseProxy={canAssignProxy ? () => setMode('proxy') : undefined}
        />
      )}
    </>
  );
}
