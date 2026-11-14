import { Candidate } from '@/types/candidate';
import CandidatePhoto from './CandidatePhoto';
import SlateTag from './SlateTag';
import { IconX } from '@/components/Icons';

export default function CandidateSheet({
  candidate,
  isSelected,
  selectionDisabled,
  onClose,
  onSelect,
}: {
  candidate: Candidate;
  isSelected: boolean;
  selectionDisabled: boolean;
  onClose: () => void;
  onSelect: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay backdrop-blur-[2px] sm:items-center sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${candidate.name} candidate profile`}
        className="no-scrollbar max-h-[88vh] w-full animate-fadeInUp overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-2xl sm:max-w-md sm:rounded-2xl"
      >
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-strong">
              Candidate profile
            </p>
            <p className="text-xs text-ink-muted">Review the information on this ballot</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close candidate profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted"
          >
            <IconX width={14} height={14} className="text-ink-soft" />
          </button>
        </div>

        <div className="bg-surface-muted/50 mb-4 flex flex-col items-center rounded-2xl px-4 py-5 text-center">
          <div className="relative mb-3">
            <CandidatePhoto candidate={candidate} size="sheet" />
            <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-ink text-[12px] font-semibold text-on-brand">
              {candidate.ballotNumber}
            </div>
          </div>
          <p className="mb-1 text-lg font-semibold tracking-tight">{candidate.name}</p>
          <div className="mb-1.5 flex items-center gap-1.5">
            <SlateTag slate={candidate.slate} />
            {candidate.isIncumbent && (
              <span className="rounded-pill bg-warning-soft px-2 py-0.5 text-[10.5px] font-medium text-warning">
                Incumbent
              </span>
            )}
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-ink-soft">
            {candidate.roleDescription}
          </p>
        </div>

        {candidate.statement && (
          <section className="mb-4 rounded-xl border border-line p-3.5">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-strong">
              Candidate statement
            </p>
            <p className="text-sm leading-relaxed text-ink-soft">{candidate.statement}</p>
          </section>
        )}

        <button
          onClick={onSelect}
          disabled={selectionDisabled}
          className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-on-brand shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSelected ? `Remove ${candidate.name}` : `Select ${candidate.name}`}
        </button>
      </div>
    </div>
  );
}
