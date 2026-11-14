import { IconBallot, IconCalendar, IconCheck, IconShield } from '@/components/Icons';
import { Election } from '@/types/candidate';
import { formatLongDate } from '@/lib/formatDate';

export default function ElectionWelcome({
  election,
  onStart,
}: {
  election: Election;
  onStart: () => void;
}) {
  const candidateCount = election.positions.reduce(
    (total, position) => total + position.candidates.length,
    0,
  );

  return (
    <div className="mx-auto max-w-2xl animate-fadeInUp pb-3">
      <section className="shadow-brand/15 relative overflow-hidden rounded-2xl bg-brand px-5 py-5 text-on-brand shadow-lg sm:px-6">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border-[24px] border-white/[0.07]" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" /> Resident election
          </span>
          <h1 className="mt-3 max-w-xl text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl">
            {election.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/85">
            <span className="inline-flex items-center gap-1.5">
              <IconCalendar width={14} height={14} /> Voting closes{' '}
              {formatLongDate(election.closesAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconBallot width={14} height={14} /> {election.positions.length} positions
            </span>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">On this ballot</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {candidateCount} candidates across {election.positions.length} positions
            </p>
          </div>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-strong">
            {election.positions.length} roles
          </span>
        </div>
        <div className="divide-y divide-line">
          {election.positions.map((position, index) => (
            <div key={position.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-[11px] font-semibold text-ink-soft">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{position.title}</p>
                <p className="text-[11px] text-ink-muted">
                  {position.candidates.length} candidates · choose up to {position.seats}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-ink">How voting works</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Review each role and confirm your choices before submitting.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['01', 'Review candidates', "Open a profile to read each candidate's statement."],
            ['02', 'Choose candidates', 'Select up to the allowed number for each position.'],
            ['03', 'Review and submit', 'Check your selections before you cast your ballot.'],
          ].map(([number, title, description]) => (
            <div key={number} className="flex gap-2.5 sm:flex-col sm:gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-[11px] font-bold text-brand-strong">
                {number}
              </span>
              <div>
                <p className="text-xs font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-brand-soft/60 mt-3 flex items-start gap-2.5 rounded-xl px-3 py-2.5">
          <IconShield width={16} height={16} className="mt-0.5 shrink-0 text-brand-strong" />
          <p className="text-[11px] leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">Review before you submit.</span> Your choices
            are not cast until you confirm the ballot. A submitted ballot cannot be changed.
          </p>
        </div>
      </section>

      <button
        onClick={onStart}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-on-brand shadow-sm transition hover:brightness-95"
      >
        <IconCheck width={17} height={17} /> Start voting
      </button>
      <p className="mt-2 text-center text-[10px] text-ink-muted">
        You can review your choices before submitting your ballot.
      </p>
    </div>
  );
}
