'use client';

import { useState } from 'react';
import { IconBallot, IconCheck, IconChevronDown } from '@/components/Icons';

export default function ElectionAccordion({
  title,
  statusLabel,
  positionCount,
  candidateCount,
  isClosed,
  isVotingOpen,
  defaultOpen,
  children,
}: {
  title: string;
  statusLabel: string;
  positionCount: number;
  candidateCount: number;
  isClosed: boolean;
  isVotingOpen: boolean;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={`mb-4 overflow-hidden rounded-2xl border bg-surface shadow-sm transition-shadow hover:shadow-md ${
        isVotingOpen ? 'border-brand/30 ring-brand/10 ring-1' : 'border-line'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`election-accordion-trigger flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors sm:px-5 ${
          isVotingOpen
            ? 'bg-brand text-on-brand hover:bg-brand-strong'
            : 'hover:bg-surface-muted/70 bg-surface'
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isVotingOpen ? 'bg-white/15 text-white' : 'bg-brand-soft text-brand-strong'
            }`}
          >
            {isClosed ? (
              <IconCheck width={18} height={18} />
            ) : (
              <IconBallot width={18} height={18} />
            )}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span
                className={`truncate text-sm font-semibold sm:text-base ${
                  isVotingOpen ? 'text-on-brand' : 'text-ink'
                }`}
              >
                {title}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  isVotingOpen
                    ? 'bg-on-brand-soft text-on-brand'
                    : isClosed
                      ? 'bg-surface-muted text-ink-muted'
                      : 'bg-brand-soft text-brand-strong'
                }`}
              >
                {statusLabel}
              </span>
            </span>
            <span
              className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] ${
                isVotingOpen ? 'text-on-brand-muted' : 'text-ink-muted'
              }`}
            >
              <span>
                {positionCount} position{positionCount === 1 ? '' : 's'}
              </span>
              <span>
                {candidateCount} candidate{candidateCount === 1 ? '' : 's'}
              </span>
              {isVotingOpen && <span className="font-medium">Ballot locked</span>}
            </span>
          </span>
        </div>
        <IconChevronDown
          width={16}
          height={16}
          className={`shrink-0 transition-transform ${isVotingOpen ? 'text-on-brand' : 'text-ink-muted'} ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="border-line/70 border-t px-3.5 pb-5 pt-4 sm:px-5">{children}</div>}
    </section>
  );
}
