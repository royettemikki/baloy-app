'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { IconBarChart, IconCheck } from '@/components/Icons';

type CandidateResult = {
  id: number;
  name: string;
  photoUrl: string | null;
  homeownerAvatarUrl: string | null;
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
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
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
  const position =
    election?.positions.find((item) => item.id === positionId) ?? election?.positions[0];
  const defaultCandidateCount = position ? Math.max(3, position.seats) : 3;
  const leaders = useMemo(
    () =>
      position
        ? showFullResults
          ? position.candidates
          : position.candidates.slice(0, Math.max(3, position.seats))
        : [],
    [position, showFullResults],
  );
  const turnout =
    election && election.eligibleVoters > 0
      ? Math.min(100, (election.ballotCount / election.eligibleVoters) * 100)
      : 0;
  const electedCount = position?.candidates.filter((candidate) => candidate.isWinner).length ?? 0;

  if (!election || !position) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 pb-3">
        {activeElection && <LiveTurnoutCard activeElection={activeElection} />}
        <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          <div className="bg-gradient-to-br from-brand-soft via-surface to-surface-muted px-5 py-9 text-center sm:px-8 sm:py-12">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-sm">
              <IconBarChart width={22} height={22} />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              {activeElection ? 'The results are not in yet' : 'No final results yet'}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              {activeElection
                ? 'Voting is still open. You can follow participation now; candidate vote totals will appear after voting closes.'
                : 'Once an election closes, its final candidate results will appear here.'}
            </p>
            <Link
              href="/vote"
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-4 text-xs font-semibold text-on-brand transition-colors hover:bg-brand-strong"
            >
              View elections
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-4">
      {activeElection && <LiveTurnoutCard activeElection={activeElection} />}

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-strong">
            Election center
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-ink">
            Election results
          </h1>
          <p className="mt-1 text-xs text-ink-soft">
            See who was elected and how each position was decided.
          </p>
        </div>
        {elections.length > 1 && (
          <label className="flex flex-col gap-1 text-[10px] font-medium text-ink-muted">
            Election
            <select
              value={election.id}
              onChange={(event) => {
                const nextElection = elections.find(
                  (item) => item.id === Number(event.target.value),
                );
                if (nextElection) {
                  setElectionId(nextElection.id);
                  setPositionId(nextElection.positions[0]?.id ?? 0);
                  setShowFullResults(false);
                }
              }}
              aria-label="Choose an election"
              className="max-w-[72vw] rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink sm:max-w-xs"
            >
              {elections.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-strong px-4 py-4 text-on-brand sm:px-5 sm:py-5">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-14 h-36 w-36 rounded-full border-[22px] border-white/[0.08]"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white">
                <IconCheck width={12} height={12} /> Final results
              </span>
              <h2 className="mt-3 break-words text-lg font-semibold tracking-tight text-white sm:text-xl">
                {election.title}
              </h2>
              <p className="mt-1 text-[11px] text-white/75">
                Voting closed {formatDate(election.closesAt)}
              </p>
            </div>
            <div className="grid min-w-[190px] flex-1 grid-cols-2 gap-2 sm:max-w-sm">
              <div className="rounded-xl bg-white/10 px-3 py-2.5">
                <p className="text-[10px] text-white/75">Ballots submitted</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-white">
                  {formatCount(election.ballotCount)}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2.5">
                <p className="text-[10px] text-white/75">Estimated participation</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-white">
                  {turnout.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <p className="relative mt-3 text-[10px] leading-relaxed text-white/75">
            Participation is estimated by comparing ballots submitted with active resident accounts.
            Candidate selections can exceed ballots when a position has multiple seats.
          </p>
        </div>
        <div className="bg-surface-muted/45 grid grid-cols-2 divide-x divide-line">
          <div className="px-4 py-3 sm:px-5">
            <p className="text-[10px] text-ink-muted">Positions on ballot</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
              {formatCount(election.positions.length)}
            </p>
          </div>
          <div className="px-4 py-3 sm:px-5">
            <p className="text-[10px] text-ink-muted">Candidate selections across election</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
              {formatCount(election.totalVotes)}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="position-results-heading">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <h2 id="position-results-heading" className="text-sm font-semibold text-ink">
              Results by position
            </h2>
            <p className="mt-0.5 text-[10px] text-ink-muted">
              Choose a position to see its candidate results.
            </p>
          </div>
          <span className="shrink-0 text-[10px] text-ink-muted">
            {election.positions.length} total
          </span>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {election.positions.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setPositionId(item.id);
                setShowFullResults(false);
              }}
              aria-pressed={position.id === item.id}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition-colors ${
                position.id === item.id
                  ? 'border-brand bg-brand-soft text-brand-strong shadow-sm'
                  : 'border-line bg-surface text-ink-soft hover:bg-surface-hover'
              }`}
            >
              <span className="block text-xs font-semibold">{item.title}</span>
              <span className="mt-0.5 block text-[9px] opacity-80">
                {item.seats} seat{item.seats === 1 ? '' : 's'} · {item.candidates.length} candidate
                {item.candidates.length === 1 ? '' : 's'}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-strong">
              Position results
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-ink">{position.title}</h2>
            <p className="mt-1 text-[11px] text-ink-soft">
              {position.seats} seat{position.seats === 1 ? '' : 's'} available
              {electedCount > 0
                ? ` · ${electedCount} candidate${electedCount === 1 ? '' : 's'} elected`
                : ' · no candidate elected'}
            </p>
          </div>
          <div className="rounded-xl bg-surface-muted px-3 py-2 text-right">
            <p className="text-[10px] text-ink-muted">Candidate selections</p>
            <p className="text-base font-semibold tabular-nums text-ink">
              {formatCount(position.totalVotes)}
            </p>
          </div>
        </div>

        {position.totalVotes === 0 && (
          <div className="border-warning/20 bg-warning-soft/50 mx-4 mt-4 flex gap-2.5 rounded-xl border px-3.5 py-3 sm:mx-5">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-warning" />
            <p className="text-[11px] leading-relaxed text-ink-soft">
              No votes were recorded for this position, so no candidate was elected.
            </p>
          </div>
        )}

        <div className="px-4 py-3 sm:px-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[10px] text-ink-muted">
              {showFullResults || position.candidates.length <= defaultCandidateCount
                ? `${position.candidates.length} candidate${position.candidates.length === 1 ? '' : 's'}`
                : `Top ${defaultCandidateCount} of ${position.candidates.length} candidates`}
            </p>
            <p className="text-[10px] font-medium text-ink-muted">Share of selections</p>
          </div>

          <div className="divide-y divide-line">
            {leaders.map((candidate, index) => (
              <div key={candidate.id} className="py-3 first:pt-2 last:pb-1">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold ${
                      candidate.isWinner
                        ? 'bg-brand text-on-brand'
                        : 'bg-surface-muted text-ink-muted'
                    }`}
                    aria-label={`Rank ${index + 1}`}
                  >
                    {index + 1}
                  </span>
                  {candidate.photoUrl || candidate.homeownerAvatarUrl ? (
                    <img
                      src={candidate.photoUrl ?? candidate.homeownerAvatarUrl ?? ''}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-[10px] font-semibold text-brand-strong">
                      {initials(candidate.name)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-xs font-semibold text-ink">{candidate.name}</p>
                      {candidate.isWinner && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-1.5 py-0.5 text-[9px] font-semibold text-brand-strong">
                          <IconCheck width={10} height={10} /> Elected
                        </span>
                      )}
                    </div>
                    <p
                      className="truncate text-[10px]"
                      style={{ color: candidate.slate?.color ?? 'var(--ink-muted)' }}
                    >
                      {candidate.slate?.name ?? 'Independent'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold tabular-nums text-ink">
                      {formatCount(candidate.votes)}{' '}
                      <span className="font-normal text-ink-muted">
                        vote{candidate.votes === 1 ? '' : 's'}
                      </span>
                    </p>
                    <p className="text-[9px] tabular-nums text-ink-muted">
                      {candidate.share.toFixed(1)}% of selections
                    </p>
                  </div>
                </div>
                <div
                  className="ml-[38px] mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted"
                  aria-label={`${candidate.share.toFixed(1)} percent of candidate selections`}
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      candidate.isWinner ? 'bg-brand' : 'bg-brand-strong/60'
                    }`}
                    style={{ width: `${candidate.share}%` }}
                  />
                </div>
              </div>
            ))}
            {leaders.length === 0 && (
              <p className="py-6 text-center text-xs text-ink-muted">
                No candidates were listed for this position.
              </p>
            )}
          </div>

          {position.candidates.length > defaultCandidateCount && (
            <button
              onClick={() => setShowFullResults((current) => !current)}
              className="mt-3 w-full rounded-xl border border-line px-3 py-2.5 text-xs font-semibold text-brand-strong transition-colors hover:bg-brand-soft"
            >
              {showFullResults
                ? 'Show leading candidates'
                : `View all ${position.candidates.length} candidates`}
            </button>
          )}
        </div>
      </section>

      <p className="px-2 text-center text-[10px] leading-relaxed text-ink-muted">
        A ballot is one submitted voting form. Candidate selections are votes for individual
        candidates; voters may select more than one candidate when a position has multiple seats.
        Turnout is an estimate based on {formatCount(election.eligibleVoters)} active resident
        accounts.
      </p>
    </div>
  );
}

function LiveTurnoutCard({ activeElection }: { activeElection: ActiveElection }) {
  const turnout =
    activeElection.eligibleVoters > 0
      ? Math.min(100, (activeElection.ballotCount / activeElection.eligibleVoters) * 100)
      : 0;

  return (
    <section className="border-brand/15 from-brand-soft/70 overflow-hidden rounded-2xl border bg-gradient-to-br via-surface to-surface-muted shadow-sm">
      <div className="bg-brand-soft/35 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-strong">
            Live participation
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-ink">{activeElection.title}</h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-brand-strong">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          Voting open
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] text-ink-muted">Ballots submitted</p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">
              {formatCount(activeElection.ballotCount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-ink-muted">Estimated participation</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-brand-strong">
              {turnout.toFixed(1)}%
            </p>
          </div>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"
          role="progressbar"
          aria-label="Estimated election participation"
          aria-valuenow={Math.round(turnout)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500"
            style={{ width: `${turnout}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-ink-muted">
          <span>of {formatCount(activeElection.eligibleVoters)} active resident accounts</span>
          <span className="shrink-0">
            Closes {formatDate(activeElection.closesAt, { month: 'short' })}
          </span>
        </div>
        <p className="mt-3 rounded-lg bg-surface-muted px-3 py-2 text-[10px] leading-relaxed text-ink-soft">
          Participation refreshes every two minutes. Candidate vote totals remain hidden until
          voting closes.
        </p>
      </div>
    </section>
  );
}
