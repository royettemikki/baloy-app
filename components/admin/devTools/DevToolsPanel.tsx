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
  deleteResidentDevToolAction,
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

const TOOLS: {
  key: ToolKey;
  title: string;
  description: string;
  danger: string;
  destructive: boolean;
}[] = [
  {
    key: 'election',
    title: 'Reset election data',
    description:
      'Deletes all elections, ballots, votes, positions, candidates, slates, filings, and expense requests. No draft or sample election is recreated.',
    danger:
      'This permanently deletes all election history and pending election-related requests. Residents, dues, announcements, and logged expenses are preserved.',
    destructive: true,
  },
  {
    key: 'announcements',
    title: 'Reseed announcements',
    description: 'Wipes all announcements and replaces them with four sample notices.',
    danger: 'This permanently deletes all current announcements.',
    destructive: true,
  },
  {
    key: 'duesAdd',
    title: 'Seed dues for new residents',
    description:
      'Adds a standard 5-charge history for any resident who has no dues charges yet. Skips anyone who already has some.',
    danger: 'This does not delete anything — safe to run anytime.',
    destructive: false,
  },
  {
    key: 'duesReset',
    title: 'Reset ALL dues & payments',
    description:
      'Wipes every dues charge and payment for every resident, then reseeds the standard 5-charge history fresh for everyone.',
    danger: 'This permanently deletes all current dues and payment data, for every resident.',
    destructive: true,
  },
];

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{description}</p>
    </div>
  );
}

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
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink">Feature visibility</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Control which features admins and residents can access.
          </p>
        </div>
        <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
          Access
        </span>
      </div>
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
          ? `Added dues history for ${result.seededCount} resident(s) without existing charges.`
          : key === 'election'
            ? 'Election data cleared.'
            : key === 'announcements'
              ? 'Announcements replaced with sample notices.'
              : 'Dues and payments reset; sample dues history added.',
      );
      router.refresh();
    });
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {message && (
        <p className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-brand-strong">{message}</p>
      )}

      {TOOLS.map((tool) => (
        <div
          key={tool.key}
          className={`rounded-2xl border bg-surface p-5 shadow-sm ${
            tool.destructive ? 'border-danger/20' : 'border-line'
          }`}
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-ink">{tool.title}</p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                tool.destructive ? 'bg-danger-soft text-danger' : 'bg-brand-soft text-brand-strong'
              }`}
            >
              {tool.destructive ? 'Destructive' : 'Non-destructive'}
            </span>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-ink-soft">{tool.description}</p>

          {confirming === tool.key ? (
            <div className="bg-danger-soft/60 rounded-xl p-3">
              <p className="mb-3 text-xs leading-relaxed text-danger">
                {tool.danger} Are you sure you want to continue?
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setConfirming(null)}
                  className="min-w-24 flex-1 rounded-lg border border-line bg-surface py-2 text-xs font-medium text-ink-soft"
                >
                  Cancel
                </button>
                <button
                  onClick={() => runTool(tool.key)}
                  disabled={pending}
                  className="min-w-32 flex-1 rounded-lg bg-danger py-2 text-xs font-semibold text-surface disabled:opacity-60"
                >
                  {pending ? 'Working…' : 'Confirm action'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(tool.key)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                tool.destructive
                  ? 'border-danger/30 border text-danger hover:bg-danger-soft'
                  : 'border border-line text-brand-strong hover:bg-brand-soft'
              }`}
            >
              {tool.destructive ? 'Review action' : 'Run tool'}
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
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <p className="mb-1 text-sm font-semibold text-ink">Send a test reminder</p>
        <p className="mb-4 text-xs leading-relaxed text-ink-soft">
          Sends through the configured SMS provider to the selected resident’s phone number.
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
            className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-on-brand disabled:opacity-60"
          >
            {pending ? 'Sending…' : 'Send SMS'}
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

      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <p className="mb-1 text-sm font-semibold text-ink">Run scheduled reminder check</p>
        <p className="mb-4 text-xs leading-relaxed text-ink-soft">
          Runs the daily job now for charges due in 3 days that haven’t been reminded.
        </p>
        <button
          onClick={handleRunCheck}
          disabled={pending}
          className="mb-3 rounded-lg border border-line px-4 py-2 text-xs font-semibold text-brand-strong hover:bg-brand-soft"
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
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <p className="mb-1 text-sm font-semibold text-ink">Run late-fee check</p>
      <p className="mb-4 text-xs leading-relaxed text-ink-soft">
        Applies configured fees to overdue charges that haven’t had a fee applied yet.
      </p>
      <button
        onClick={handleRun}
        disabled={pending}
        className="mb-3 rounded-lg border border-line px-4 py-2 text-xs font-semibold text-brand-strong hover:bg-brand-soft"
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
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <p className="mb-1 text-sm font-semibold text-ink">Set a test password</p>
      <p className="mb-4 text-xs leading-relaxed text-ink-soft">
        Update a resident’s password to sign in to a local test account.
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
          className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-on-brand disabled:opacity-60"
        >
          {pending ? 'Setting…' : 'Set password'}
        </button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      {message && <p className="text-xs text-brand-strong">{message}</p>}
    </div>
  );
}

function DeleteResidentSection() {
  const [residents, setResidents] = useState<
    { id: string; fullName: string; email: string; unit: string }[]
  >([]);
  const [selectedId, setSelectedId] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    listAllResidentsAction().then((result) => {
      if ('success' in result && result.success) {
        setResidents(result.homeowners ?? []);
      }
    });
  }, []);

  function handleDelete() {
    if (!selectedId) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await deleteResidentDevToolAction(selectedId);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
        return;
      }

      setResidents((current) => current.filter((resident) => resident.id !== selectedId));
      setSelectedId('');
      setConfirming(false);
      setMessage('Resident and their linked test data were deleted.');
      router.refresh();
    });
  }

  return (
    <div className="border-danger/30 bg-danger-soft/20 rounded-2xl border p-5 shadow-sm sm:p-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">Delete a resident</p>
        <span className="rounded-full bg-danger-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-danger">
          Permanent
        </span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-ink-soft">
        Removes the resident and their linked activity. Candidate records are kept but unlinked.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={selectedId}
          onChange={(event) => {
            setSelectedId(event.target.value);
            setConfirming(false);
            setError(null);
            setMessage(null);
          }}
          className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
        >
          <option value="">Choose resident by name, unit, or email…</option>
          {residents.map((resident) => (
            <option key={resident.id} value={resident.id}>
              {resident.fullName} — {resident.unit} ({resident.email})
            </option>
          ))}
        </select>
        {!confirming ? (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMessage(null);
              setConfirming(true);
            }}
            disabled={!selectedId || pending}
            className="rounded-lg bg-danger px-4 py-2 text-xs font-medium text-surface disabled:opacity-60"
          >
            Delete resident
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink-soft"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="rounded-lg bg-danger px-4 py-2 text-xs font-medium text-surface disabled:opacity-60"
            >
              {pending ? 'Deleting…' : 'Confirm delete'}
            </button>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
      {message && <p className="mt-2 text-xs text-brand-strong">{message}</p>}
    </div>
  );
}

export default function DevToolsPanel({
  featureSettings,
}: {
  featureSettings: FeatureVisibilityState;
}) {
  return (
    <div className="space-y-8">
      <nav
        aria-label="Dev tools categories"
        className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-surface p-2 shadow-sm"
      >
        {[
          ['features', 'Feature access'],
          ['tests', 'Test workflows'],
          ['data', 'Sample data'],
          ['accounts', 'Test accounts'],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-brand-soft hover:text-brand-strong"
          >
            {label}
          </a>
        ))}
      </nav>
      <section id="features" className="scroll-mt-6">
        <SectionHeading
          title="Feature access"
          description="Choose which features are available in the admin and resident experience."
        />
        <FeatureVisibilitySection initialSettings={featureSettings} />
      </section>
      <section id="tests" className="scroll-mt-6">
        <SectionHeading
          title="Test workflows"
          description="Send a sample notification or run scheduled billing checks on demand."
        />
        <div className="grid gap-3 lg:grid-cols-2">
          <SmsTestSection />
          <LateFeeTestSection />
        </div>
      </section>
      <section id="data" className="scroll-mt-6">
        <SectionHeading
          title="Sample data"
          description="Populate scenarios for testing. Actions marked destructive erase existing data."
        />
        <SeedToolsSection />
      </section>
      <section id="accounts" className="scroll-mt-6">
        <SectionHeading
          title="Test accounts"
          description="Prepare resident accounts for login testing or clean up test residents."
        />
        <div className="grid gap-3 lg:grid-cols-2">
          <SetPasswordSection />
          <DeleteResidentSection />
        </div>
      </section>
    </div>
  );
}
