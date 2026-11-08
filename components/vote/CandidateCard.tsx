import { Candidate } from '@/types/candidate';
import CandidatePhoto from './CandidatePhoto';
import SlateTag from './SlateTag';
import { IconCheck, IconUser } from '@/components/Icons';

export default function CandidateCard({
  candidate,
  isSelected,
  isCompareSelected,
  compareDisabled,
  onSelect,
  onViewProfile,
  onToggleCompare,
}: {
  candidate: Candidate;
  isSelected: boolean;
  isCompareSelected: boolean;
  compareDisabled: boolean;
  onSelect: () => void;
  onViewProfile: () => void;
  onToggleCompare: () => void;
}) {
  return (
    <article
      className={`mb-2.5 overflow-hidden rounded-xl border bg-surface transition-colors ${
        isSelected ? 'border-brand ring-1 ring-brand/20' : 'border-line hover:border-brand/40'
      }`}
    >
      <button onClick={onSelect} aria-pressed={isSelected} className="flex w-full items-center gap-3 p-3 text-left">
        <CandidatePhoto candidate={candidate} size="list" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-ink">{candidate.name}</span>
            {candidate.isIncumbent && (
              <span className="shrink-0 rounded-full bg-warning-soft px-1.5 py-0.5 text-[9px] font-semibold text-warning">Incumbent</span>
            )}
          </span>
          <span className="mt-1 flex min-w-0 items-center gap-1.5">
            <span className="truncate"><SlateTag slate={candidate.slate} /></span>
            <span className="truncate text-[11px] text-ink-muted">{candidate.roleDescription}</span>
          </span>
        </span>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-brand bg-brand text-on-brand' : 'border-line text-transparent'}`}>
          <IconCheck width={13} height={13} />
        </span>
      </button>
      <div className="flex items-center justify-between border-t border-line bg-surface-muted/40 px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Ballot no. {candidate.ballotNumber}</span>
        <span className="flex items-center gap-3">
          <button onClick={onToggleCompare} disabled={compareDisabled} aria-pressed={isCompareSelected} className={`text-[11px] font-semibold ${isCompareSelected ? 'text-brand-strong' : 'text-ink-muted'} hover:text-brand-strong disabled:cursor-not-allowed disabled:opacity-40`}>
            {isCompareSelected ? 'In comparison' : 'Compare'}
          </button>
          <button onClick={onViewProfile} className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-strong hover:underline">
            <IconUser width={12} height={12} /> Profile
          </button>
        </span>
      </div>
    </article>
  );
}
