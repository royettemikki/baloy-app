'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { IconBarChart, IconCheck } from '@/components/Icons';

type CandidateResult = {
  id: number;
  name: string;
  photoUrl: string | null;
  slate: { name: string; color: string } | null;
  votes: number;
  share: number;
  isWinner: boolean;
};

type PositionResult = {
  id: number;
  title: string;
  seats: number;
  totalVotes: number;
  candidates: CandidateResult[];
};

type ElectionResult = {
  id: number;
  title: string;
  closesAt: string;
  totalVotes: number;
  ballotCount: number;
  eligibleVoters: number;
  positions: PositionResult[];
};

type ActiveElection = {
  title: string;
  closesAt: string;
  ballotCount: number;
  eligibleVoters: number;
};

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export default function ElectionResultsDashboard({
  elections,
  activeElection,
}: {
  elections: ElectionResult[];
  activeElection: ActiveElection | null;
}) {
  const [electionId, setElectionId] = useState(elections[0]?.id ?? 0);
  const election = elections.find((item) => item.id === electionId) ?? elections[0];
  const [positionId, setPositionId] = useState(election?.positions[0]?.id ?? 0);
  const [showFullResults, setShowFullResults] = useState(false);
  const position = election?.positions.find((item) => item.id === positionId) ?? election?.positions[0];
  const leaders = useMemo(
    () => position ? (showFullResults ? position.candidates : position.candidates.slice(0, 3)) : [],
    [position, showFullResults],
  );

  if (!election || !position) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {activeElection && <LiveTurnoutCard activeElection={activeElection} />}
        <div className="rounded-2xl border border-dashed border-line bg-surface px-5 py-10 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
            <IconBarChart width={20} height={20} />
          </div>
          <h2 className="text-sm font-semibold text-ink">No results published yet</h2>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-ink-muted">
            Final candidate results will appear here after voting closes.
          </p>
          <Link href="/vote" className="mt-4 inline-flex min-h-9 items-center rounded-xl bg-brand px-3.5 text-xs font-semibold text-on-brand">
            Back to elections
          </Link>
        </div>
      </div>
    );
  }

  const turnout = election.eligibleVoters > 0
    ? Math.min(100, (election.ballotCount / election.eligibleVoters) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-3xl pb-3">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-strong">Election center</p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-ink">Election results</h1>
        </div>
        {elections.length > 1 && (
          <select
            value={election.id}
            onChange={(event) => {
              const nextElection = elections.find((item) => item.id === Number(event.target.value));
              if (nextElection) {
                setElectionId(nextElection.id);
                setPositionId(nextElection.positions[0]?.id ?? 0);
                setShowFullResults(false);
              }
            }}
            aria-label="Choose an election"
            className="max-w-[52%] rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-ink"
          >
            {elections.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        )}
      </header>

      {activeElection && <div className="mb-4"><LiveTurnoutCard activeElection={activeElection} /></div>}

      <div className="mb-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">{election.title}</p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              Closed {new Date(election.closesAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold text-brand-strong">
            <IconCheck width={12} height={12} /> Final results
          </span>
        </div>
      </div>

      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
        {election.positions.map((item) => (
          <button
            key={item.id}
            onClick={() => { setPositionId(item.id); setShowFullResults(false); }}
            aria-pressed={position.id === item.id}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${position.id === item.id ? 'border-brand bg-brand-soft text-brand-strong' : 'border-line bg-surface text-ink-soft hover:bg-surface-hover'}`}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="mb-3 rounded-xl border border-line bg-surface px-3.5 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand" />
          <p className="text-xs font-semibold text-ink">Final count</p>
          <span className="ml-auto text-[10px] text-ink-muted">Voting closed</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-line bg-surface px-3.5 py-3 shadow-sm">
          <p className="text-[10px] text-ink-muted">Valid votes counted</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{formatCount(position.totalVotes)}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface px-3.5 py-3 shadow-sm">
          <p className="text-[10px] text-ink-muted">Estimated turnout</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{turnout.toFixed(1)}%</p>
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-surface p-3.5 shadow-sm sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">{showFullResults ? 'All candidates' : 'Leading candidates'}</h2>
            <p className="text-[10px] text-ink-muted">{position.title} · {position.seats} seat{position.seats === 1 ? '' : 's'}</p>
          </div>
          <span className="text-[10px] text-ink-muted">Share of votes</span>
        </div>

        <div className="divide-y divide-line">
          {leaders.map((candidate) => (
            <div key={candidate.id} className="py-3 first:pt-2 last:pb-1">
              <div className="flex items-center gap-2.5">
                {candidate.photoUrl ? (
                  <img src={candidate.photoUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-[10px] font-semibold text-brand-strong">{initials(candidate.name)}</span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs font-semibold text-ink">{candidate.name}</p>
                    {candidate.isWinner && <span className="shrink-0 rounded-full bg-brand-soft px-1.5 py-0.5 text-[9px] font-semibold text-brand-strong">Elected</span>}
                  </div>
                  <p className="truncate text-[10px]" style={{ color: candidate.slate?.color ?? 'var(--ink-muted)' }}>{candidate.slate?.name ?? 'Independent'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold tabular-nums text-ink">{candidate.share.toFixed(1)}%</p>
                  <p className="text-[9px] tabular-nums text-ink-muted">{formatCount(candidate.votes)} votes</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div className={`h-full rounded-full ${candidate.isWinner ? 'bg-brand' : 'bg-brand-strong/70'}`} style={{ width: `${candidate.share}%` }} />
              </div>
            </div>
          ))}
          {leaders.length === 0 && <p className="py-5 text-center text-xs text-ink-muted">No candidates were listed for this position.</p>}
        </div>

        {position.candidates.length > 3 && (
          <button
            onClick={() => setShowFullResults((current) => !current)}
            className="mt-3 w-full rounded-xl border border-line px-3 py-2.5 text-xs font-semibold text-brand-strong transition-colors hover:bg-brand-soft"
          >
            {showFullResults ? 'Show leading candidates' : `View all ${position.candidates.length} candidates`}
          </button>
        )}
      </section>

      <div className="mt-3 rounded-xl border border-line bg-surface px-3.5 py-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-ink-soft">Ballots submitted</span>
          <span className="font-semibold tabular-nums text-ink">{formatCount(election.ballotCount)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-[11px]">
          <span className="text-ink-soft">Total valid votes</span>
          <span className="font-semibold tabular-nums text-ink">{formatCount(election.totalVotes)}</span>
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] leading-relaxed text-ink-muted">
        Turnout is based on {formatCount(election.eligibleVoters)} active resident accounts. Candidate vote totals are shown only after the election closes.
      </p>
    </div>
  );
}

function LiveTurnoutCard({ activeElection }: { activeElection: ActiveElection }) {
  const turnout = activeElection.eligibleVoters > 0
    ? Math.min(100, (activeElection.ballotCount / activeElection.eligibleVoters) * 100)
    : 0;

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-soft/70 via-surface to-surface-muted shadow-sm">
      <div className="flex items-center justify-between gap-3 bg-brand-soft/35 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-strong">Live participation</p>
          <h2 className="mt-0.5 text-sm font-semibold text-ink">{activeElection.title}</h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-brand-strong">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Voting open
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] text-ink-muted">Ballots submitted</p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">{formatCount(activeElection.ballotCount)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-ink-muted">Estimated turnout</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-brand-strong">{turnout.toFixed(1)}%</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${turnout}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-ink-muted">
          <span>of {formatCount(activeElection.eligibleVoters)} active resident accounts</span>
          <span>Closes {new Date(activeElection.closesAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <p className="mt-3 rounded-lg bg-surface-muted px-3 py-2 text-[10px] leading-relaxed text-ink-soft">
          Participation refreshes every two minutes. Candidate vote totals remain hidden until voting closes.
        </p>
      </div>
    </section>
  );
}
