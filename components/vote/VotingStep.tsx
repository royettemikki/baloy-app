import { Position } from '@/types/candidate';
import CandidateCard from './CandidateCard';
import StepRing from './StepRing';

export default function VotingStep({
  position,
  stepIndex,
  totalSteps,
  selected,
  fromReview,
  hasSlates,
  onSelect,
  onViewProfile,
  onOpenSlatePicker,
  onBack,
  onContinue,
}: {
  position: Position;
  stepIndex: number;
  totalSteps: number;
  selected: number | undefined;
  fromReview: boolean;
  hasSlates: boolean;
  onSelect: (candidateId: number) => void;
  onViewProfile: (candidateId: number) => void;
  onOpenSlatePicker: () => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className='flex flex-col h-full animate-fadeInUp'>
      <div className='flex-1'>
        <div className='flex items-start justify-between mb-4'>
          <div>
            <p className='text-xs text-ink-muted mb-0.5'>
              Position {stepIndex + 1} of {totalSteps}
            </p>
            <h1 className='text-xl font-medium mb-0.5'>{position.title}</h1>
            <p className='text-sm text-ink-soft'>
              {position.seats} seat{position.seats === 1 ? '' : 's'} · select
              one candidate
            </p>
          </div>
          <StepRing current={stepIndex + 1} total={totalSteps} />
        </div>

        {hasSlates && (
          <button
            onClick={onOpenSlatePicker}
            className='text-xs font-medium text-brand mb-4 flex items-center gap-1'
          >
            Vote for a whole team instead →
          </button>
        )}

        {position.candidates.map((c) => (
          <CandidateCard
            key={c.id}
            candidate={c}
            isSelected={selected === c.id}
            onSelect={() => onSelect(c.id)}
            onViewProfile={() => onViewProfile(c.id)}
          />
        ))}
      </div>

      <div className='pt-3.5 pb-1 border-t border-line -mx-5 px-5 flex gap-2.5'>
        {stepIndex > 0 && !fromReview && (
          <button
            onClick={onBack}
            className='px-4 py-3.5 text-sm font-medium text-ink-soft'
          >
            Back
          </button>
        )}
        <button
          onClick={onContinue}
          disabled={!selected}
          className='flex-1 bg-brand disabled:opacity-50 text-on-brand rounded-xl py-3.5 text-sm font-medium'
        >
          {fromReview
            ? 'Save and return'
            : stepIndex < totalSteps - 1
              ? 'Continue'
              : 'Review ballot'}
        </button>
      </div>
    </div>
  );
}
