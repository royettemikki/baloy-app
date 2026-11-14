import { Position } from '@/types/candidate';
import CandidatePhoto from './CandidatePhoto';
import SlateTag from './SlateTag';

export default function BallotReview({
  electionTitle,
  positions,
  selections,
  onChange,
  onSubmit,
  error,
  pending,
}: {
  electionTitle: string;
  positions: Position[];
  selections: Record<number, number[]>;
  onChange: (index: number) => void;
  onSubmit: () => void;
  error: string | null;
  pending: boolean;
}) {
  return (
    <div className="flex h-full animate-fadeInUp flex-col">
      <div className="flex-1">
        <p className="mb-0.5 text-xs text-ink-muted">Review your ballot</p>
        <h1 className="mb-4 text-xl font-medium">{electionTitle}</h1>

        {error && <p className="mb-3 text-center text-xs text-danger">{error}</p>}

        {positions.map((position, index) => {
          const candidates = position.candidates.filter((candidate) =>
            selections[position.id]?.includes(candidate.id),
          );
          if (candidates.length === 0) return null;
          return (
            <div key={position.id} className="mb-2.5 rounded-2xl border border-line p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-xs text-ink-muted">
                  {position.title} · {candidates.length} selected
                </p>
                <button onClick={() => onChange(index)} className="text-xs font-medium text-brand">
                  Change
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center gap-2.5">
                    <CandidatePhoto candidate={candidate} size="card" />
                    <div>
                      <p className="text-sm font-medium">
                        #{candidate.ballotNumber} {candidate.name}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <SlateTag slate={candidate.slate} />
                        {candidate.isIncumbent && (
                          <span className="rounded-pill bg-warning-soft px-2 py-0.5 text-[10.5px] font-medium text-warning">
                            Incumbent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <p className="mt-1 text-xs text-ink-muted">Once submitted, your ballot can't be changed.</p>
      </div>

      <div className="-mx-5 border-t border-line px-5 pb-1 pt-3.5">
        <button
          onClick={onSubmit}
          disabled={pending}
          className="w-full rounded-xl bg-brand py-3.5 text-sm font-medium text-on-brand disabled:opacity-60"
        >
          {pending ? 'Submitting…' : 'Submit ballot'}
        </button>
      </div>
    </div>
  );
}
