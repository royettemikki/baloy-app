import Skeleton from '@/components/Skeleton';

export default function VoteLoading() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-[22px] h-[22px] rounded-full" />
        <Skeleton className="h-0.5 flex-1" />
        <Skeleton className="w-[22px] h-[22px] rounded-full" />
      </div>
      <Skeleton className="w-16 h-3 mb-1.5" />
      <Skeleton className="w-28 h-5 mb-1.5" />
      <Skeleton className="w-40 h-3.5 mb-4" />
      {[0, 1].map((i) => (
        <Skeleton key={i} className="w-full h-16 rounded-2xl mb-2.5" />
      ))}
    </div>
  );
}