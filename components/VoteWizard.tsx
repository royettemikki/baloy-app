'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { castBallotAction } from '@/app/actions';
import { IconCheck } from '@/components/Icons';

type Candidate = { id: number; name: string; roleDescription: string };
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
  const router = useRouter();

  if (remaining.length === 0 && phase !== 'complete') setPhase('complete');

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
      <div className='flex flex-col h-full text-center'>
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
      <div className='flex flex-col h-full'>
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
                  <div className='w-8 h-8 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center text-[11.5px] font-semibold flex-shrink-0'>
                    {candidate.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className='text-sm font-medium'>{candidate.name}</p>
                    <p className='text-xs text-ink-soft'>
                      {candidate.roleDescription}
                    </p>
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
        <div className='flex items-center gap-2 mb-4'>
          {remaining.map((_, i) => (
            <div key={i} className='flex items-center flex-1 last:flex-none'>
              <div
                className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 ${
                  i <= stepIndex
                    ? 'bg-brand text-on-brand'
                    : 'bg-surface-muted text-ink-muted'
                }`}
              >
                {i + 1}
              </div>
              {i < remaining.length - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded ${i < stepIndex ? 'bg-brand' : 'bg-surface-muted'}`}
                />
              )}
            </div>
          ))}
        </div>

        <p className='text-xs text-ink-muted mb-0.5'>
          Position {stepIndex + 1} of {remaining.length}
        </p>
        <h1 className='text-xl font-medium mb-0.5'>{position.title}</h1>
        <p className='text-sm text-ink-soft mb-4'>
          {position.seats} seat{position.seats === 1 ? '' : 's'} · select one
          candidate
        </p>

        {position.candidates.map((c) => {
          const isSelected = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() =>
                setSelections((prev) => ({ ...prev, [position.id]: c.id }))
              }
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl mb-2.5 text-left ${
                isSelected
                  ? 'border-2 border-brand bg-brand-soft'
                  : 'border border-line'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0 ${
                  isSelected
                    ? 'bg-white text-brand-strong'
                    : 'bg-surface-muted text-ink-soft'
                }`}
              >
                {c.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>{c.name}</p>
                <p className='text-xs text-ink-soft'>{c.roleDescription}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-brand' : 'border border-line'}`}
              >
                {isSelected && (
                  <IconCheck width={12} height={12} className='text-white' />
                )}
              </div>
            </button>
          );
        })}
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
    </div>
  );
}
