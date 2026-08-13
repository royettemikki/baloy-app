import { Candidate } from '@/types/candidate';
import CandidatePhoto from './CandidatePhoto';
import SlateTag from './SlateTag';
import { IconX } from '@/components/Icons';

export default function CandidateSheet({
  candidate,
  onClose,
  onSelect,
}: {
  candidate: Candidate;
  onClose: () => void;
  onSelect: () => void;
}) {
  return (
    <div className='fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center'>
      <div className='w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto no-scrollbar animate-fadeInUp'>
        <div className='flex justify-end mb-2'>
          <button
            onClick={onClose}
            className='w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center'
          >
            <IconX width={14} height={14} className='text-ink-soft' />
          </button>
        </div>

        <div className='flex flex-col items-center text-center mb-5'>
          <div className='relative mb-3'>
            <CandidatePhoto candidate={candidate} size='sheet' />
            <div className='absolute -top-2 -left-2 w-7 h-7 rounded-full bg-ink text-white text-[12px] font-semibold flex items-center justify-center border-2 border-surface'>
              {candidate.ballotNumber}
            </div>
          </div>
          <p className='text-lg font-medium mb-1'>{candidate.name}</p>
          <div className='flex items-center gap-1.5 mb-1.5'>
            <SlateTag slate={candidate.slate} />
            {candidate.isIncumbent && (
              <span className='text-[10.5px] font-medium px-2 py-0.5 rounded-pill bg-warning-soft text-warning'>
                Incumbent
              </span>
            )}
          </div>
          <p className='text-xs text-ink-soft'>{candidate.roleDescription}</p>
        </div>

        {candidate.statement && (
          <>
            <p className='text-[12px] font-medium text-ink-muted uppercase tracking-wide mb-2'>
              Candidate statement
            </p>
            <p className='text-sm text-ink-soft leading-relaxed mb-5'>
              {candidate.statement}
            </p>
          </>
        )}

        <button
          onClick={onSelect}
          className='w-full bg-brand text-on-brand rounded-xl py-3.5 text-sm font-medium'
        >
          Select {candidate.name}
        </button>
      </div>
    </div>
  );
}
