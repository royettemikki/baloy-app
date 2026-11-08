type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export default function SectionHeader({ title, description, action, className = '' }: Props) {
  return (
    <div className={`mb-4 flex items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
