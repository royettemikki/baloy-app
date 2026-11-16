'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  resetElectionDataAction,
  reseedAnnouncementsAction,
  reseedDuesAction,
  resetDuesAction,
  listResidentsForSmsTestAction,
  sendTestReminderAction,
  runReminderCheckNowAction,
  listAllResidentsAction,
  setTestPasswordAction,
  updateFeatureVisibilityAction,
} from '@/app/actions/devTools';
import { ReminderOutcome } from '@/lib/duesReminders';
import { runLateFeeCheckNowAction } from '@/app/actions/devTools';
import { FEATURE_VISIBILITY } from '@/lib/featureVisibilityConfig';
import type {
  FeatureAudience,
  FeatureKey,
  FeatureVisibilityState,
} from '@/lib/featureVisibilityConfig';

type ToolKey = 'election' | 'announcements' | 'duesAdd' | 'duesReset';

const TOOLS: { key: ToolKey; title: string; description: string; danger: string }[] = [
  {
    key: 'election',
    title: 'Reset election data',
    description:
      'Deletes all elections, ballots, votes, positions, candidates, slates, filings, and expense requests. No draft or sample election is recreated.',
    danger:
      'This permanently deletes all election history and pending election-related requests. Residents, dues, announcements, and logged expenses are preserved.',
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
  election: resetElectionDataAction,
  announcements: reseedAnnouncementsAction,
  duesAdd: reseedDuesAction,
  duesReset: resetDuesAction,
};

function FeatureVisibilitySection({
  initialSettings,
}: {
  initialSettings: FeatureVisibilityState;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggleFeature(key: FeatureKey, audience: FeatureAudience) {
    const enabled = !settings[key][audience];
    setMessage(null);
    startTransition(async () => {
      const result = await updateFeatureVisibilityAction(key, audience, enabled);
      if ('error' in result) {
        setMessage(result.error ?? 'Unable to update feature visibility.');
        return;
      }

      setSettings((current) => ({
        ...current,
        [key]: { ...current[key], [audience]: enabled },
      }));
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="mb-1 text-sm font-medium">Feature visibility</p>
      <p className="mb-4 text-xs text-ink-soft">
        Turn features on or off separately for admins and residents. Hidden features are removed
        from navigation and blocked when opened directly.
      </p>
      {message && (
        <p role="alert" className="mb-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {message}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-xs">
          <thead>
            <tr className="border-b border-line text-ink-muted">
              <th className="pb-2 pr-3 font-medium">Feature</th>
              <th className="px-3 pb-2 text-center font-medium">Admin</th>
              <th className="pb-2 pl-3 text-center font-medium">Resident</th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_VISIBILITY.map((feature) => (
              <tr key={feature.key} className="border-line/70 border-b last:border-0">
                <th scope="row" className="py-3 pr-3 font-medium text-ink">
                  {feature.label}
                </th>
                {(['admin', 'resident'] as const).map((audience) => (
                  <td key={audience} className="px-3 py-2 text-center">
                    {feature[audience] ? (
                      <button
                        type="button"
                        aria-pressed={settings[feature.key][audience]}
                        aria-label={`${feature.label}: ${settings[feature.key][audience] ? 'visible' : 'hidden'} for ${audience}s`}
                        onClick={() => toggleFeature(feature.key, audience)}
                        disabled={pending}
                        className={`min-w-16 rounded-full px-3 py-1.5 font-medium transition-colors disabled:opacity-60 ${
                          settings[feature.key][audience]
                            ? 'bg-brand-soft text-brand-strong'
                            : 'bg-surface-muted text-ink-muted'
                        }`}
                      >
                        {settings[feature.key][audience] ? 'Visible' : 'Hidden'}
                      </button>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
                  className="flex-1 rounded-lg bg-danger py-2 text-xs font-medium text-surface disabled:opacity-60"
                >
                  {pending ? 'Running…' : 'Yes, run it'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(tool.key)}
              className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-brand-strong"
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
            className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
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
            className="rounded-lg bg-brand px-4 py-2 text-xs font-medium text-on-brand disabled:opacity-60"
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
          className="mb-3 rounded-lg border border-line px-4 py-2 text-xs font-medium text-brand-strong"
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

function LateFeeTestSection() {
  const [outcomes, setOutcomes] = useState<
    { homeownerName: string; chargeDescription: string; feeAmount: number }[] | null
  >(null);
  const [pending, startTransition] = useTransition();

  function handleRun() {
    setOutcomes(null);
    startTransition(async () => {
      const result = await runLateFeeCheckNowAction();
      if ('outcomes' in result) setOutcomes(result.outcomes ?? []);
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="mb-1 text-sm font-medium">Run the late fee check now</p>
      <p className="mb-3 text-xs text-ink-soft">
        Finds every charge past its due date with no fee applied yet, adds the configured late fee,
        and marks the original charge Overdue.
      </p>
      <button
        onClick={handleRun}
        disabled={pending}
        className="mb-3 rounded-lg border border-line px-4 py-2 text-xs font-medium text-brand-strong"
      >
        {pending ? 'Running…' : 'Run check'}
      </button>
      {outcomes && (
        <div className="flex flex-col gap-1.5">
          {outcomes.length === 0 && (
            <p className="text-xs text-ink-muted">Nothing overdue right now.</p>
          )}
          {outcomes.map((o, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-xs"
            >
              <span>
                {o.homeownerName} — {o.chargeDescription}
              </span>
              <span className="font-medium text-danger">+₱{o.feeAmount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SetPasswordSection() {
  const [residents, setResidents] = useState<{ id: string; fullName: string; email: string }[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    listAllResidentsAction().then((result) => {
      if ('success' in result && result.success) {
        setResidents(result.homeowners ?? []);
      }
    });
  }, []);

  function handleSet() {
    if (!selectedId || !password) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await setTestPasswordAction(selectedId, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage('Password updated.');
      setPassword('');
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="mb-1 text-sm font-medium">Set a resident's password</p>
      <p className="mb-3 text-xs text-ink-soft">
        For logging into a test account when you don't know its password — this only works locally.
      </p>

      <div className="mb-2 flex flex-col gap-2 sm:flex-row">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
        >
          <option value="">Select a resident…</option>
          {residents.map((r) => (
            <option key={r.id} value={r.id}>
              {r.fullName} ({r.email})
            </option>
          ))}
        </select>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 characters)"
          className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
        />
        <button
          onClick={handleSet}
          disabled={!selectedId || !password || pending}
          className="rounded-lg bg-brand px-4 py-2 text-xs font-medium text-on-brand disabled:opacity-60"
        >
          {pending ? 'Setting…' : 'Set password'}
        </button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      {message && <p className="text-xs text-brand-strong">{message}</p>}
    </div>
  );
}

export default function DevToolsPanel({
  featureSettings,
}: {
  featureSettings: FeatureVisibilityState;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-3 text-sm font-medium text-ink-soft">Feature controls</p>
        <FeatureVisibilitySection initialSettings={featureSettings} />
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-ink-soft">SMS reminders</p>
        <SmsTestSection />
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-ink-soft">Seed data</p>
        <SeedToolsSection />
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-ink-soft">Late fees</p>
        <LateFeeTestSection />
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-ink-soft">Accounts</p>
        <SetPasswordSection />
      </div>
    </div>
  );
}
