'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  resetElectionSeedAction,
  reseedAnnouncementsAction,
  reseedDuesAction,
  resetDuesAction,
  listResidentsForSmsTestAction,
  sendTestReminderAction,
  runReminderCheckNowAction,
} from '@/app/actions/devTools';
import { ReminderOutcome } from '@/lib/duesReminders';

type ToolKey = 'election' | 'announcements' | 'duesAdd' | 'duesReset';

const TOOLS: { key: ToolKey; title: string; description: string; danger: string }[] = [
  {
    key: 'election',
    title: 'Reset election data',
    description:
      'Wipes every election, position, candidate, slate, and vote, then creates one fresh 2-position election.',
    danger: 'This permanently deletes all current election and voting data.',
  },
  {
    key: 'announcements',
    title: 'Reseed announcements',
    description: 'Wipes all announcements and replaces them with four sample notices.',
    danger: 'This permanently deletes all current announcements.',
  },
  {
    key: 'duesAdd',
    title: 'Seed dues for new residents',
    description:
      'Adds a standard 5-charge history for any resident who has no dues charges yet. Skips anyone who already has some.',
    danger: 'This does not delete anything — safe to run anytime.',
  },
  {
    key: 'duesReset',
    title: 'Reset ALL dues & payments',
    description:
      'Wipes every dues charge and payment for every resident, then reseeds the standard 5-charge history fresh for everyone.',
    danger: 'This permanently deletes all current dues and payment data, for every resident.',
  },
];

const ACTIONS: Record<ToolKey, () => Promise<any>> = {
  election: resetElectionSeedAction,
  announcements: reseedAnnouncementsAction,
  duesAdd: reseedDuesAction,
  duesReset: resetDuesAction,
};

function SeedToolsSection() {
  const [confirming, setConfirming] = useState<ToolKey | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function runTool(key: ToolKey) {
    setMessage(null);
    startTransition(async () => {
      const result = await ACTIONS[key]();
      setConfirming(null);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage(
        'seededCount' in result
          ? `Done — seeded dues for ${result.seededCount} resident(s).`
          : 'Done.',
      );
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {message && (
        <p className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-brand-strong">{message}</p>
      )}

      {TOOLS.map((tool) => (
        <div key={tool.key} className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="mb-1 text-sm font-medium">{tool.title}</p>
          <p className="mb-3 text-xs text-ink-soft">{tool.description}</p>

          {confirming === tool.key ? (
            <div>
              <p className="mb-2 text-xs text-danger">{tool.danger} Are you sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirming(null)}
                  className="flex-1 rounded-lg border border-line py-2 text-xs font-medium text-ink-soft"
                >
                  Cancel
                </button>
                <button
                  onClick={() => runTool(tool.key)}
                  disabled={pending}
                  className="flex-1 rounded-lg bg-danger py-2 text-xs font-medium text-white disabled:opacity-60"
                >
                  {pending ? 'Running…' : 'Yes, run it'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(tool.key)}
              className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-brand"
            >
              Run
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function SmsTestSection() {
  const [residents, setResidents] = useState<
    { id: string; fullName: string; phoneNumber: string | null }[]
  >([]);
  const [selectedId, setSelectedId] = useState('');
  const [testResult, setTestResult] = useState<{
    message: string;
    phoneNumber: string;
    usedRealCharge: boolean;
  } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<ReminderOutcome[] | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    listResidentsForSmsTestAction().then((result) => {
      if ('success' in result && result.success) {
        setResidents(result.homeowners ?? []);
      }
    });
  }, []);

  function handleSendTest() {
    if (!selectedId) return;
    setTestError(null);
    setTestResult(null);
    startTransition(async () => {
      const result = await sendTestReminderAction(selectedId);
      if (result.error) {
        setTestError(result.error);
        return;
      }
      setTestResult(result as any);
    });
  }

  function handleRunCheck() {
    setOutcomes(null);
    startTransition(async () => {
      const result = await runReminderCheckNowAction();
      if ('success' in result && result.success) {
        setOutcomes(result.outcomes ?? []);
      } else if ('error' in result) {
        setTestError(result.error ?? 'Something went wrong.');
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <p className="mb-1 text-sm font-medium">Send a test reminder SMS</p>
        <p className="mb-3 text-xs text-ink-soft">
          Picks a resident, builds a real reminder message, and sends it through whichever provider
          is currently configured (
          <code className="rounded bg-surface-muted px-1">SMS_PROVIDER</code>). Uses their real next
          Due charge if one exists, otherwise a labeled sample.
        </p>

        <div className="mb-3 flex gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          >
            <option value="">Select a resident…</option>
            {residents.map((r) => (
              <option key={r.id} value={r.id} disabled={!r.phoneNumber}>
                {r.fullName} {r.phoneNumber ? '' : '(no phone number)'}
              </option>
            ))}
          </select>
          <button
            onClick={handleSendTest}
            disabled={!selectedId || pending}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
          >
            {pending ? 'Sending…' : 'Send test'}
          </button>
        </div>

        {testError && <p className="text-xs text-danger">{testError}</p>}
        {testResult && (
          <div className="rounded-lg bg-surface-muted p-3 text-xs">
            <p className="mb-1 text-ink-muted">
              To: {testResult.phoneNumber}{' '}
              {testResult.usedRealCharge ? '' : '· using sample data (no real Due charge found)'}
            </p>
            <p className="text-ink-soft">{testResult.message}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <p className="mb-1 text-sm font-medium">Run the real reminder check now</p>
        <p className="mb-3 text-xs text-ink-soft">
          Runs the exact same logic the daily cron job uses — finds every charge due in 3 days that
          hasn't been reminded yet, and sends/skips accordingly.
        </p>
        <button
          onClick={handleRunCheck}
          disabled={pending}
          className="mb-3 rounded-lg border border-line px-4 py-2 text-xs font-medium text-brand"
        >
          {pending ? 'Running…' : 'Run check'}
        </button>

        {outcomes && (
          <div className="flex flex-col gap-1.5">
            {outcomes.length === 0 && (
              <p className="text-xs text-ink-muted">
                No charges are due in exactly 3 days right now.
              </p>
            )}
            {outcomes.map((o, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-xs"
              >
                <span>{o.homeownerName}</span>
                <span
                  className={
                    o.status === 'sent'
                      ? 'font-medium text-brand-strong'
                      : o.status === 'skipped'
                        ? 'text-ink-muted'
                        : 'font-medium text-danger'
                  }
                >
                  {o.status}
                  {o.reason ? ` — ${o.reason}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DevToolsPanel() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-3 text-sm font-medium text-ink-soft">SMS reminders</p>
        <SmsTestSection />
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-ink-soft">Seed data</p>
        <SeedToolsSection />
      </div>
    </div>
  );
}
