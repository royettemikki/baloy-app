import Skeleton from '@/components/Skeleton';

export default function NoticesLoading() {
  return (
    <div>
      <Skeleton className="w-24 h-5 mb-3.5" />
      <div className="flex gap-1.5 mb-4">
        <Skeleton className="w-14 h-7 rounded-pill" />
        <Skeleton className="w-24 h-7 rounded-pill" />
        <Skeleton className="w-16 h-7 rounded-pill" />
        <Skeleton className="w-16 h-7 rounded-pill" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-2.5 p-3.5 rounded-2xl mb-2.5 bg-surface-muted">
          <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="w-2/3 h-3.5 mb-1.5" />
            <Skeleton className="w-full h-3 mb-1" />
            <Skeleton className="w-1/3 h-2.5" />
          </div>
        </div>
      ))}
    </div>
  );
}