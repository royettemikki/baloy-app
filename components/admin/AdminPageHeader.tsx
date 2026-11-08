import type { ReactNode } from 'react';

export default function AdminPageHeader({
  title,
  description,
  action,
  eyebrow = 'Administration',
}: {
  title: string;
  description: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-strong">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
