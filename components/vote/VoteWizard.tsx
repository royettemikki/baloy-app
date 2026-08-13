'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { castBallotAction } from '@/app/actions/elections';
import { Election, Candidate } from '@/types/candidate';
import VotingStep from './VotingStep';
import BallotReview from './BallotReview';
import BallotComplete from './BallotComplete';
import CandidateSheet from './CandidateSheet';
import SlatePicker from './SlatePicker';

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
  const [viewingCandidateId, setViewingCandidateId] = useState<number | null>(
    null,
  );
  const [showSlatePicker, setShowSlatePicker] = useState(false);
  const router = useRouter();

  if (remaining.length === 0 && phase !== 'complete') setPhase('complete');

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
    setViewingCandidateId(null);
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
    setPhase(nextIndex === -1 ? 'review' : 'voting');
    if (nextIndex !== -1) setStepIndex(nextIndex);
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
    return <BallotComplete alreadyDone={alreadyDone} />;
  }

  if (phase === 'review') {
    return (
      <BallotReview
        electionTitle={election.title}
        positions={remaining}
        selections={selections}
        onChange={handleChange}
        onSubmit={handleSubmitBallot}
        error={error}
        pending={pending}
      />
    );
  }

  const position = remaining[stepIndex];
  const viewingCandidate: Candidate | undefined = position.candidates.find(
    (c) => c.id === viewingCandidateId,
  );

  return (
    <div key={stepIndex}>
      <VotingStep
        position={position}
        stepIndex={stepIndex}
        totalSteps={remaining.length}
        selected={selections[position.id]}
        fromReview={fromReview}
        hasSlates={availableSlates.length > 0}
        onSelect={(candidateId) => selectCandidate(position.id, candidateId)}
        onViewProfile={setViewingCandidateId}
        onOpenSlatePicker={() => setShowSlatePicker(true)}
        onBack={() => stepIndex > 0 && setStepIndex(stepIndex - 1)}
        onContinue={handleContinue}
      />

      {viewingCandidate && (
        <CandidateSheet
          candidate={viewingCandidate}
          onClose={() => setViewingCandidateId(null)}
          onSelect={() => selectCandidate(position.id, viewingCandidate.id)}
        />
      )}

      {showSlatePicker && (
        <SlatePicker
          slates={availableSlates}
          onClose={() => setShowSlatePicker(false)}
          onPick={handleQuickVote}
        />
      )}
    </div>
  );
}
