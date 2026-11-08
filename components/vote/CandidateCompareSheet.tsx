'use client';

import { Candidate } from '@/types/candidate';
import CandidatePhoto from './CandidatePhoto';
import SlateTag from './SlateTag';
import { IconX } from '@/components/Icons';

export default function CandidateCompareSheet({
  candidates,
  onClose,
}: {
  candidates: Candidate[];
  onClose: () => void;
}) {
  if (candidates.length !== 2) return null;
  const rows = [
    { label: 'Affiliation', value: (candidate: Candidate) => candidate.slate?.name ?? 'Independent' },
    { label: 'Role description', value: (candidate: Candidate) => candidate.roleDescription || 'Not provided' },
    { label: 'Incumbent', value: (candidate: Candidate) => candidate.isIncumbent ? 'Yes' : 'No' },
    { label: 'Candidate statement', value: (candidate: Candidate) => candidate.statement || 'No statement provided' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-overlay sm:items-center sm:p-5" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-compare-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-surface p-4 shadow-2xl sm:rounded-2xl sm:p-5"
      >
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-strong">Candidate guide</p>
            <h2 id="candidate-compare-title" className="mt-0.5 text-lg font-semibold text-ink">Compare candidates</h2>
            <p className="text-xs text-ink-muted">Side-by-side information for this position</p>
          </div>
          <button onClick={onClose} aria-label="Close comparison" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-ink-soft">
            <IconX width={15} height={15} />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-2.5">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="flex min-w-0 flex-col items-center rounded-xl bg-surface-muted/60 px-2 py-3 text-center">
              <CandidatePhoto candidate={candidate} size="list" />
              <p className="mt-2 w-full truncate text-xs font-semibold text-ink">{candidate.name}</p>
              <div className="mt-1 max-w-full"><SlateTag slate={candidate.slate} /></div>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          {rows.map((row) => (
            <div key={row.label}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{row.label}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="min-w-0 rounded-lg border border-line bg-surface px-2.5 py-2 text-[11px] leading-relaxed text-ink-soft">
                    {row.value(candidate)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-lg bg-brand-soft/50 px-3 py-2 text-[10px] leading-relaxed text-ink-soft">
          Compare information from candidate profiles and statements. Details are shown as provided in the election portal.
        </p>
      </section>
    </div>
  );
}
