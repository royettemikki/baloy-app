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
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-overlay backdrop-blur-[2px] sm:items-center sm:p-5'>
      <div role='dialog' aria-modal='true' aria-label={`${candidate.name} candidate profile`} className='no-scrollbar max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-2xl animate-fadeInUp sm:max-w-md sm:rounded-2xl'>
        <div className='mb-2 flex items-center justify-between'>
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-strong'>Candidate profile</p>
            <p className='text-xs text-ink-muted'>Review the information on this ballot</p>
          </div>
          <button
            onClick={onClose}
            aria-label='Close candidate profile'
            className='flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted'
          >
            <IconX width={14} height={14} className='text-ink-soft' />
          </button>
        </div>

        <div className='mb-4 flex flex-col items-center rounded-2xl bg-surface-muted/50 px-4 py-5 text-center'>
          <div className='relative mb-3'>
            <CandidatePhoto candidate={candidate} size='sheet' />
            <div className='absolute -top-2 -left-2 w-7 h-7 rounded-full bg-ink text-on-brand text-[12px] font-semibold flex items-center justify-center border-2 border-surface'>
              {candidate.ballotNumber}
            </div>
          </div>
          <p className='mb-1 text-lg font-semibold tracking-tight'>{candidate.name}</p>
          <div className='flex items-center gap-1.5 mb-1.5'>
            <SlateTag slate={candidate.slate} />
            {candidate.isIncumbent && (
              <span className='text-[10.5px] font-medium px-2 py-0.5 rounded-pill bg-warning-soft text-warning'>
                Incumbent
              </span>
            )}
          </div>
          <p className='max-w-xs text-xs leading-relaxed text-ink-soft'>{candidate.roleDescription}</p>
        </div>

        {candidate.statement && (
          <section className='mb-4 rounded-xl border border-line p-3.5'>
            <p className='mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-strong'>Candidate statement</p>
            <p className='text-sm leading-relaxed text-ink-soft'>{candidate.statement}</p>
          </section>
        )}

        <button
          onClick={onSelect}
          className='w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-on-brand shadow-sm'
        >
          Select {candidate.name}
        </button>
      </div>
    </div>
  );
}
