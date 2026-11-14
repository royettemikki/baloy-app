import { memo } from 'react';
import { Position } from '@/types/candidate';
import CandidateCard from './CandidateCard';
import StepRing from './StepRing';

const PositionHeader = memo(function PositionHeader({
  title,
  seats,
  stepIndex,
  totalSteps,
}: {
  title: string;
  seats: number;
  stepIndex: number;
  totalSteps: number;
}) {
  return (
    <section className="mb-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-strong">
          Your ballot
        </p>
        <span className="rounded-full bg-surface-muted px-2 py-1 text-[10px] font-medium text-ink-muted">
          Step {stepIndex + 1} of {totalSteps}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-0.5 text-xs text-ink-soft">
            Choose up to {seats} candidate{seats === 1 ? '' : 's'}
          </p>
        </div>
        <StepRing current={stepIndex + 1} total={totalSteps} />
      </div>
    </section>
  );
});

export default function VotingStep({
  position,
  stepIndex,
  totalSteps,
  selected,
  fromReview,
  hasSlates,
  onSelect,
  onViewProfile,
  compareCandidateIds,
  onToggleCompare,
  onOpenCompare,
  onOpenSlatePicker,
  onBack,
  onContinue,
}: {
  position: Position;
  stepIndex: number;
  totalSteps: number;
  selected: number[];
  fromReview: boolean;
  hasSlates: boolean;
  onSelect: (candidateId: number) => void;
  onViewProfile: (candidateId: number) => void;
  compareCandidateIds: number[];
  onToggleCompare: (candidateId: number) => void;
  onOpenCompare: () => void;
  onOpenSlatePicker: () => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const atSelectionLimit = selected.length >= position.seats;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <PositionHeader
          title={position.title}
          seats={position.seats}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
        />

        {hasSlates && (
          <button
            onClick={onOpenSlatePicker}
            className="mb-3 flex items-center gap-1 text-xs font-medium text-brand-strong"
          >
            Vote for a whole team instead <span aria-hidden="true">&gt;</span>
          </button>
        )}

        {compareCandidateIds.length === 2 && (
          <button
            onClick={onOpenCompare}
            className="border-brand/25 bg-brand-soft/40 mb-3 flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold text-brand-strong"
          >
            <span>Compare 2 candidates</span>
            <span aria-hidden="true">&gt;</span>
          </button>
        )}

        <p className="mb-2 text-xs text-ink-muted">
          {selected.length} of {position.seats} selected. Choose at least one.
        </p>
        {position.candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selected.includes(candidate.id)}
            selectionDisabled={atSelectionLimit && !selected.includes(candidate.id)}
            isCompareSelected={compareCandidateIds.includes(candidate.id)}
            compareDisabled={
              compareCandidateIds.length >= 2 && !compareCandidateIds.includes(candidate.id)
            }
            onSelect={() => onSelect(candidate.id)}
            onViewProfile={() => onViewProfile(candidate.id)}
            onToggleCompare={() => onToggleCompare(candidate.id)}
          />
        ))}
        {position.candidates.length === 0 && (
          <div className="rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center text-xs text-ink-muted">
            No candidates have been added for this position yet.
          </div>
        )}
      </div>

      <div className="bg-surface/95 -mx-5 flex gap-2.5 border-t border-line px-5 pb-1 pt-3.5 backdrop-blur">
        {stepIndex > 0 && !fromReview && (
          <button
            onClick={onBack}
            className="rounded-xl border border-line px-4 py-3.5 text-sm font-medium text-ink-soft"
          >
            Back
          </button>
        )}
        <button
          onClick={onContinue}
          disabled={selected.length === 0}
          className="flex-1 rounded-xl bg-brand py-3.5 text-sm font-semibold text-on-brand shadow-sm disabled:opacity-50"
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
