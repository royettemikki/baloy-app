type Tone = 'brand' | 'warning' | 'danger' | 'purple' | 'neutral';

const TONES: Record<Tone, string> = {
  brand: 'text-brand-strong bg-brand-soft',
  warning: 'text-warning bg-warning-soft',
  danger: 'text-danger bg-danger-soft',
  purple: 'text-purple bg-purple-soft',
  neutral: 'text-ink-soft bg-surface-muted',
};

const DOT_COLORS: Record<Tone, string> = {
  brand: 'bg-brand-strong',
  warning: 'bg-warning',
  danger: 'bg-danger',
  purple: 'bg-purple',
  neutral: 'bg-ink-soft',
};

export default function Badge({
  tone = 'neutral',
  dot = false,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-medium ${TONES[tone]}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[tone]}`} />}
      {children}
    </span>
  );
}
