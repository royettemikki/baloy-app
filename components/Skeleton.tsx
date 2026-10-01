export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface-muted rounded animate-pulse ${className}`} />
  );
}
