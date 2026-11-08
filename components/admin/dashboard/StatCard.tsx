import { ReactNode } from 'react';

export default function StatCard({
  icon,
  value,
  label,
  sublabel,
  sublabelClassName = 'text-ink-muted',
}: {
  icon: ReactNode;
  value: string;
  label: string;
  sublabel?: string;
  sublabelClassName?: string;
}) {
  return (
    <div className="ui-card p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
        {icon}
      </div>
      <p className="mb-1 text-2xl font-semibold text-ink">{value}</p>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
      {sublabel && <p className={`text-xs ${sublabelClassName}`}>{sublabel}</p>}
    </div>
  );
}
