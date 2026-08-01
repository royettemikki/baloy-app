'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { castBallotAction } from '@/app/actions';
import { IconCheck, IconX } from '@/components/Icons';

type Slate = { name: string; color: string } | null;
type Candidate = {
  id: number;
  name: string;
  roleDescription: string;
  photoUrl: string | null;
  statement: string | null;
  ballotNumber: number;
  isIncumbent: boolean;
  slate: Slate;
};
type Position = {
  id: number;
  title: string;
  seats: number;
  candidates: Candidate[];
};
type Election = {
  id: number;
  title: string;
  closesAt: string;
  positions: Position[];
};

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function CandidatePhoto({
  candidate,
  size,
}: {
  candidate: Candidate;
  size: 'card' | 'sheet';
}) {
  const dims =
    size === 'card'
      ? 'w-[64px] h-[64px] rounded-xl'
      : 'w-[92px] h-[92px] rounded-2xl';
  if (candidate.photoUrl) {
    return (
      <img
        src={candidate.photoUrl}
        alt={candidate.name}
        className={`${dims} object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dims} bg-brand-soft text-brand-strong flex items-center justify-center font-semibold flex-shrink-0 ${size === 'card' ? 'text-base' : 'text-2xl'}`}
    >
      {initials(candidate.name)}
    </div>
  );
}

function SlateTag({ slate }: { slate: Slate }) {
  if (!slate) {
    return (
      <span className='text-[10.5px] font-medium px-2 py-0.5 rounded-pill bg-surface-muted text-ink-soft'>
        Independent
      </span>
    );
  }
  return (
    <span
      className='text-[10.5px] font-medium px-2 py-0.5 rounded-pill'
      style={{ backgroundColor: `${slate.color}1A`, color: slate.color }}
    >
      {slate.name}
    </span>
  );
}

function StepRing({ current, total }: { current: number; total: number }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - current / total);

  return (
    <div className='relative w-14 h-14 flex-shrink-0'>
      <svg width='56' height='56' viewBox='0 0 56 56' className='-rotate-90'>
        <circle
          cx='28'
          cy='28'
          r={radius}
          fill='none'
          stroke='var(--surface-muted)'
          strokeWidth='4'
        />
        <circle
          cx='28'
          cy='28'
          r={radius}
          fill='none'
          stroke='var(--brand)'
          strokeWidth='4'
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-[11px] font-semibold text-ink'>
          {current}/{total}
        </span>
      </div>
    </div>
  );
}

export default function VoteWizard({
  election,
  votedPositionIds,
}: {
  election: Election;
  votedPositionIds: number[];
}) {
  const remaining = election.positions.filter(
    (p) => !votedPositionIds.includes(p.id),
  );

  const [phase, setPhase] = useState<'voting' | 'review' | 'complete'>(
    remaining.length === 0 ? 'complete' : 'voting',
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [fromReview, setFromReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(
    null,
  );
  const [showSlatePicker, setShowSlatePicker] = useState(false);
  const router = useRouter();

  if (remaining.length === 0 && phase !== 'complete') setPhase('complete');

  // Every distinct slate that appears anywhere in this election, for the quick-vote shortcut.
  const availableSlates = Array.from(
    new Map(
      remaining
        .flatMap((p) => p.candidates)
        .filter((c) => c.slate)
        .map((c) => [c.slate!.name, c.slate!]),
    ).values(),
  );

  function selectCandidate(positionId: number, candidateId: number) {
    setSelections((prev) => ({ ...prev, [positionId]: candidateId }));
    setViewingCandidate(null);
  }

  function handleQuickVote(slateName: string) {
    const merged = { ...selections };
    remaining.forEach((position) => {
      const match = position.candidates.find(
        (c) => c.slate?.name === slateName,
      );
      if (match) merged[position.id] = match.id;
    });
    setSelections(merged);
    setShowSlatePicker(false);

    const nextIndex = remaining.findIndex((p) => !merged[p.id]);
    if (nextIndex === -1) {
      setPhase('review');
    } else {
      setStepIndex(nextIndex);
    }
  }

  function handleContinue() {
    if (fromReview) {
      setFromReview(false);
      setPhase('review');
      return;
    }
    if (stepIndex < remaining.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setPhase('review');
    }
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function handleChange(index: number) {
    setStepIndex(index);
    setFromReview(true);
    setPhase('voting');
  }

  function handleSubmitBallot() {
    setError(null);
    const payload = remaining.map((p) => ({
      positionId: p.id,
      candidateId: selections[p.id],
    }));
    startTransition(async () => {
      const result = await castBallotAction(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      setPhase('complete');
      router.refresh();
    });
  }

  if (phase === 'complete') {
    const alreadyDone =
      remaining.length === 0 && Object.keys(selections).length === 0;
    return (
      <div
        key='complete'
        className='flex flex-col h-full text-center animate-fadeInUp'
      >
        <div className='flex-1 flex flex-col items-center justify-center px-8'>
          <div className='w-14 h-14 rounded-full bg-brand-soft flex items-center justify-center mb-4'>
            <IconCheck width={26} height={26} className='text-brand' />
          </div>
          <p className='text-lg font-medium mb-1.5'>Ballot submitted</p>
          <p className='text-sm text-ink-soft leading-relaxed'>
            {alreadyDone
              ? "You've already completed your ballot for this election."
              : 'Your vote has been recorded. Results are shared after voting closes.'}
          </p>
        </div>
        <button
          onClick={() => router.push('/home')}
          className='w-full bg-brand text-on-brand rounded-xl py-3.5 text-sm font-medium'
        >
          Back to home
        </button>
      </div>
    );
  }

  if (phase === 'review') {
    return (
      <div key='review' className='flex flex-col h-full animate-fadeInUp'>
        <div className='flex-1'>
          <p className='text-xs text-ink-muted mb-0.5'>Review your ballot</p>
          <h1 className='text-xl font-medium mb-4'>{election.title}</h1>

          {error && (
            <p className='text-danger text-xs text-center mb-3'>{error}</p>
          )}

          {remaining.map((position, index) => {
            const candidate = position.candidates.find(
              (c) => c.id === selections[position.id],
            );
            if (!candidate) return null;
            return (
              <div
                key={position.id}
                className='border border-line rounded-2xl p-3.5 mb-2.5'
              >
                <div className='flex items-center justify-between mb-2.5'>
                  <p className='text-xs text-ink-muted'>{position.title}</p>
                  <button
                    onClick={() => handleChange(index)}
                    className='text-xs text-brand font-medium'
                  >
                    Change
                  </button>
                </div>
                <div className='flex items-center gap-2.5'>
                  <CandidatePhoto candidate={candidate} size='card' />
                  <div>
                    <p className='text-sm font-medium'>
                      #{candidate.ballotNumber} {candidate.name}
                    </p>
                    <div className='flex items-center gap-1.5 mt-1'>
                      <SlateTag slate={candidate.slate} />
                      {candidate.isIncumbent && (
                        <span className='text-[10.5px] font-medium px-2 py-0.5 rounded-pill bg-warning-soft text-warning'>
                          Incumbent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <p className='text-xs text-ink-muted mt-1'>
            Once submitted, your ballot can't be changed.
          </p>
        </div>

        <div className='pt-3.5 pb-1 border-t border-line -mx-5 px-5'>
          <button
            onClick={handleSubmitBallot}
            disabled={pending}
            className='w-full bg-brand disabled:opacity-60 text-on-brand rounded-xl py-3.5 text-sm font-medium'
          >
            {pending ? 'Submitting…' : 'Submit ballot'}
          </button>
        </div>
      </div>
    );
  }

  // phase === 'voting'
  const position = remaining[stepIndex];
  const selected = selections[position.id];

  return (
    <div key={stepIndex} className='flex flex-col h-full animate-fadeInUp'>
      <div className='flex-1'>
        {availableSlates.length > 0 && (
          <button
            onClick={() => setShowSlatePicker(true)}
            className='text-xs font-medium text-brand mb-4 flex items-center gap-1'
          >
            Vote for a whole team instead →
          </button>
        )}

        <div className='flex items-start justify-between mb-4'>
          <div>
            <p className='text-xs text-ink-muted mb-0.5'>
              Position {stepIndex + 1} of {remaining.length}
            </p>
            <h1 className='text-xl font-medium mb-0.5'>{position.title}</h1>
            <p className='text-sm text-ink-soft'>
              {position.seats} seat{position.seats === 1 ? '' : 's'} · select
              one candidate
            </p>
          </div>
          <StepRing current={stepIndex + 1} total={remaining.length} />
        </div>

        {position.candidates.map((c) => {
          const isSelected = selected === c.id;
          return (
            <div
              key={c.id}
              className={`relative rounded-2xl mb-3 p-4 ${isSelected ? 'border-2 border-brand bg-brand-soft' : 'border border-line'}`}
            >
              {isSelected && (
                <div className='absolute top-3 right-3 w-6 h-6 rounded-full bg-brand flex items-center justify-center'>
                  <IconCheck width={13} height={13} className='text-white' />
                </div>
              )}

              <button
                onClick={() => selectCandidate(position.id, c.id)}
                className='w-full text-left'
              >
                <div className='flex items-start gap-3 mb-3'>
                  <div className='relative flex-shrink-0'>
                    <CandidatePhoto candidate={c} size='card' />
                    <div className='absolute -top-2 -left-2 w-6 h-6 rounded-full bg-ink text-white text-[11px] font-semibold flex items-center justify-center border-2 border-surface'>
                      {c.ballotNumber}
                    </div>
                  </div>
                  <div className='flex-1 pr-6'>
                    <p className='text-sm font-medium mb-1.5'>{c.name}</p>
                    <div className='flex items-center gap-1.5 flex-wrap mb-1.5'>
                      <SlateTag slate={c.slate} />
                      {c.isIncumbent && (
                        <span className='text-[10.5px] font-medium px-2 py-0.5 rounded-pill bg-warning-soft text-warning'>
                          Incumbent
                        </span>
                      )}
                    </div>
                    <p className='text-xs text-ink-soft'>{c.roleDescription}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setViewingCandidate(c)}
                className='w-full text-xs font-medium text-brand border border-line rounded-lg py-2'
              >
                View profile
              </button>
            </div>
          );
        })}

        {showSlatePicker && (
          <div className='fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center'>
            <div className='w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto no-scrollbar animate-fadeInUp'>
              <div className='flex justify-end mb-2'>
                <button
                  onClick={() => setShowSlatePicker(false)}
                  className='w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center'
                >
                  <IconX width={14} height={14} className='text-ink-soft' />
                </button>
              </div>

              <p className='text-sm font-medium mb-1'>
                Vote for your preferred team
              </p>
              <p className='text-xs text-ink-muted mb-4'>
                This fills in every position your chosen team is running for —
                including positions you've already picked. Anything they're not
                running for stays as-is, and you can still review or change
                anything before submitting.
              </p>

              <div className='flex flex-col gap-2'>
                {availableSlates.map((slate) => (
                  <button
                    key={slate.name}
                    onClick={() => handleQuickVote(slate.name)}
                    className='flex items-center gap-2.5 border border-line rounded-xl px-3.5 py-2.5 text-left'
                  >
                    <span
                      className='w-2.5 h-2.5 rounded-full flex-shrink-0'
                      style={{ backgroundColor: slate.color }}
                    />
                    <span className='text-sm font-medium flex-1'>
                      {slate.name}
                    </span>
                    <span className='text-xs text-ink-muted'>
                      Use this team →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='pt-3.5 pb-1 border-t border-line -mx-5 px-5 flex gap-2.5'>
        {stepIndex > 0 && !fromReview && (
          <button
            onClick={handleBack}
            className='px-4 py-3.5 text-sm font-medium text-ink-soft'
          >
            Back
          </button>
        )}
        <button
          onClick={handleContinue}
          disabled={!selected}
          className='flex-1 bg-brand disabled:opacity-50 text-on-brand rounded-xl py-3.5 text-sm font-medium'
        >
          {fromReview
            ? 'Save and return'
            : stepIndex < remaining.length - 1
              ? 'Continue'
              : 'Review ballot'}
        </button>
      </div>

      {viewingCandidate && (
        <div className='fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center'>
          <div className='w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto no-scrollbar animate-fadeInUp'>
            <div className='flex justify-end mb-2'>
              <button
                onClick={() => setViewingCandidate(null)}
                className='w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center'
              >
                <IconX width={14} height={14} className='text-ink-soft' />
              </button>
            </div>

            <div className='flex flex-col items-center text-center mb-5'>
              <div className='relative mb-3'>
                <CandidatePhoto candidate={viewingCandidate} size='sheet' />
                <div className='absolute -top-2 -left-2 w-7 h-7 rounded-full bg-ink text-white text-[12px] font-semibold flex items-center justify-center border-2 border-surface'>
                  {viewingCandidate.ballotNumber}
                </div>
              </div>
              <p className='text-lg font-medium mb-1'>
                {viewingCandidate.name}
              </p>
              <div className='flex items-center gap-1.5 mb-1.5'>
                <SlateTag slate={viewingCandidate.slate} />
                {viewingCandidate.isIncumbent && (
                  <span className='text-[10.5px] font-medium px-2 py-0.5 rounded-pill bg-warning-soft text-warning'>
                    Incumbent
                  </span>
                )}
              </div>
              <p className='text-xs text-ink-soft'>
                {viewingCandidate.roleDescription}
              </p>
            </div>

            {viewingCandidate.statement && (
              <>
                <p className='text-[12px] font-medium text-ink-muted uppercase tracking-wide mb-2'>
                  Candidate statement
                </p>
                <p className='text-sm text-ink-soft leading-relaxed mb-5'>
                  {viewingCandidate.statement}
                </p>
              </>
            )}

            <button
              onClick={() => selectCandidate(position.id, viewingCandidate.id)}
              className='w-full bg-brand text-on-brand rounded-xl py-3.5 text-sm font-medium'
            >
              Select {viewingCandidate.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
