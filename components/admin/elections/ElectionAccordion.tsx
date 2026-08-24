'use client';

import { useState } from 'react';
import { IconChevronDown } from '@/components/Icons';

export default function ElectionAccordion({
  title,
  statusLabel,
  isClosed,
  defaultOpen,
  children,
}: {
  title: string;
  statusLabel: string;
  isClosed: boolean;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 py-1 text-left"
      >
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{title}</p>
          <span
            className={`rounded-pill px-2 py-0.5 text-[11px] font-medium ${
              isClosed ? 'bg-surface-muted text-ink-muted' : 'bg-brand-soft text-brand-strong'
            }`}
          >
            {statusLabel}
          </span>
        </div>
        <IconChevronDown
          width={16}
          height={16}
          className={`flex-shrink-0 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
