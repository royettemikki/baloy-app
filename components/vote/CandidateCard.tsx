import { Candidate } from '@/types/candidate';
import CandidatePhoto from './CandidatePhoto';
import SlateTag from './SlateTag';
import { IconCheck } from '@/components/Icons';

export default function CandidateCard({
  candidate,
  isSelected,
  onSelect,
  onViewProfile,
}: {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
  onViewProfile: () => void;
}) {
  return (
    <div
      className={`relative rounded-2xl mb-3 p-4 ${isSelected ? 'border-2 border-brand bg-brand-soft' : 'border border-line'}`}
    >
      {isSelected && (
        <div className='absolute top-3 right-3 w-6 h-6 rounded-full bg-brand flex items-center justify-center'>
          <IconCheck width={13} height={13} className='text-white' />
        </div>
      )}

      <button onClick={onSelect} className='w-full text-left'>
        <div className='flex items-start gap-3 mb-3'>
          <div className='relative flex-shrink-0'>
            <CandidatePhoto candidate={candidate} size='card' />
            <div className='absolute -top-2 -left-2 w-6 h-6 rounded-full bg-ink text-white text-[11px] font-semibold flex items-center justify-center border-2 border-surface'>
              {candidate.ballotNumber}
            </div>
          </div>
          <div className='flex-1 pr-6'>
            <p className='text-sm font-medium mb-1.5'>{candidate.name}</p>
            <div className='flex items-center gap-1.5 flex-wrap mb-1.5'>
              <SlateTag slate={candidate.slate} />
              {candidate.isIncumbent && (
                <span className='text-[10.5px] font-medium px-2 py-0.5 rounded-pill bg-warning-soft text-warning'>
                  Incumbent
                </span>
              )}
            </div>
            <p className='text-xs text-ink-soft'>{candidate.roleDescription}</p>
          </div>
        </div>
      </button>

      <button
        onClick={onViewProfile}
        className='w-full text-xs font-medium text-brand border border-line rounded-lg py-2'
      >
        View profile
      </button>
    </div>
  );
}
