'use client';

import { useState } from 'react';
import { IconChevronDown } from '@/components/Icons';

export default function ElectionAccordion({
  title,
  statusLabel,
  isClosed,
  isVotingOpen,
  defaultOpen,
  children,
}: {
  title: string;
  statusLabel: string;
  isClosed: boolean;
  isVotingOpen: boolean;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={`mb-3 overflow-hidden rounded-2xl bg-surface shadow-sm transition-colors ${isVotingOpen ? 'ring-1 ring-brand/20' : ''}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`election-accordion-trigger flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors sm:px-5 ${
          isVotingOpen ? 'bg-brand text-on-brand hover:bg-brand-strong' : 'bg-surface hover:bg-surface-muted'
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <p className={`truncate text-sm font-semibold sm:text-base ${isVotingOpen ? 'text-on-brand' : 'text-ink'}`}>{title}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isVotingOpen ? 'bg-on-brand-soft text-on-brand' : isClosed ? 'bg-surface-muted text-ink-muted' : 'bg-brand-soft text-brand-strong'
            }`}
          >
            {statusLabel}
          </span>
        </div>
        <IconChevronDown
          width={16}
          height={16}
          className={`shrink-0 transition-transform ${isVotingOpen ? 'text-on-brand' : 'text-ink-muted'} ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-3.5 pb-4 pt-4 sm:px-5">{children}</div>}
    </section>
  );
}
