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
  selections: Record<number, number>;
  onChange: (index: number) => void;
  onSubmit: () => void;
  error: string | null;
  pending: boolean;
}) {
  return (
    <div className='flex flex-col h-full animate-fadeInUp'>
      <div className='flex-1'>
        <p className='text-xs text-ink-muted mb-0.5'>Review your ballot</p>
        <h1 className='text-xl font-medium mb-4'>{electionTitle}</h1>

        {error && (
          <p className='text-danger text-xs text-center mb-3'>{error}</p>
        )}

        {positions.map((position, index) => {
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
                  onClick={() => onChange(index)}
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
          onClick={onSubmit}
          disabled={pending}
          className='w-full bg-brand disabled:opacity-60 text-on-brand rounded-xl py-3.5 text-sm font-medium'
        >
          {pending ? 'Submitting…' : 'Submit ballot'}
        </button>
      </div>
    </div>
  );
}
