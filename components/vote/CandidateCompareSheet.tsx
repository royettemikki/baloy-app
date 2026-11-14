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

  return (
    <div
      className="bg-ink/70 fixed inset-0 z-[60] flex items-end justify-center p-0 backdrop-blur-md sm:items-center sm:p-5"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-compare-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[96dvh] w-full max-w-5xl animate-fadeInUp flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-2xl sm:max-h-[92dvh] sm:rounded-[28px]"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-5 py-3 sm:px-7 sm:py-3.5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-strong">
              Voter&apos;s guide
            </p>
            <h2
              id="candidate-compare-title"
              className="text-base font-semibold tracking-tight text-ink sm:text-lg"
            >
              Meet the candidates
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <IconX width={15} height={15} />
          </button>
        </header>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          <section aria-label="Candidate matchup">
            <div className="grid grid-cols-2 border-y border-line">
              {candidates.map((candidate, index) => (
                <article
                  key={candidate.id}
                  className={`min-w-0 ${index === 0 ? 'border-r border-line' : ''}`}
                >
                  <div className="from-brand-strong/15 to-accentwarm-soft/50 relative flex h-[clamp(135px,24dvh,240px)] items-center justify-center overflow-hidden bg-gradient-to-br via-brand-soft sm:h-[clamp(145px,26dvh,270px)]">
                    <CandidatePhoto candidate={candidate} size="compare" />
                  </div>
                  <div className="min-h-[116px] px-3 py-3 sm:min-h-[138px] sm:px-6 sm:py-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-brand-strong sm:text-[9px]">
                        Ballot no. {String(candidate.ballotNumber).padStart(2, '0')}
                      </p>
                      {candidate.isIncumbent && (
                        <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-warning">
                          Incumbent
                        </span>
                      )}
                    </div>
                    <h4 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-tight tracking-tight text-ink sm:text-xl">
                      {candidate.name}
                    </h4>
                    <p className="mt-1 line-clamp-1 text-[10px] leading-relaxed text-ink-muted sm:mt-1.5 sm:text-xs">
                      {candidate.roleDescription || 'No role description provided.'}
                    </p>
                    <div className="mt-2">
                      <SlateTag slate={candidate.slate} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="px-5 pb-5 pt-5 sm:px-8 sm:pb-7 sm:pt-7">
            <div className="mb-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-strong">
                In their own words
              </p>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-ink sm:text-lg">
                Candidate statements
              </h3>
            </div>
            <div className="grid grid-cols-2">
              {candidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className={`min-w-0 py-1 ${index === 0 ? 'border-r border-line pr-3 sm:pr-6' : 'pl-3 sm:pl-6'}`}
                >
                  <p className="mb-2 line-clamp-1 text-[9px] font-semibold uppercase tracking-wide text-ink-muted">
                    {candidate.name}
                  </p>
                  <p className="whitespace-pre-wrap break-words text-xs leading-[1.75] text-ink-soft sm:text-sm">
                    {candidate.statement?.trim() || 'This candidate has not provided a statement.'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <p className="px-5 pb-5 text-center text-[10px] leading-relaxed text-ink-muted sm:px-8 sm:pb-6 sm:text-xs">
            Take your time reviewing both candidates. Your vote is your choice.
          </p>
        </div>

        <footer className="bg-surface/95 shrink-0 border-t border-line px-5 py-2.5 backdrop-blur sm:px-7 sm:py-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 w-full rounded-xl bg-brand px-5 text-sm font-semibold text-on-brand shadow-sm transition hover:bg-brand-strong"
          >
            Back to the ballot
          </button>
        </footer>
      </section>
    </div>
  );
}
