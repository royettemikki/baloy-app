import Skeleton from '@/components/Skeleton';

export default function HomeLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div>
            <Skeleton className="w-24 h-3.5 mb-1.5" />
            <Skeleton className="w-32 h-3" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      <Skeleton className="w-full h-24 rounded-2xl mb-3.5" />
      <Skeleton className="w-full h-16 rounded-2xl mb-3.5" />

      <Skeleton className="w-32 h-3.5 mb-2" />
      <div className="flex gap-2.5 py-3">
        <Skeleton className="w-[34px] h-[34px] rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="w-3/4 h-3.5 mb-1.5" />
          <Skeleton className="w-full h-3" />
        </div>
      </div>
      <div className="flex gap-2.5 py-3 border-t border-line">
        <Skeleton className="w-[34px] h-[34px] rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="w-2/3 h-3.5 mb-1.5" />
          <Skeleton className="w-full h-3" />
        </div>
      </div>
    </div>
  );
}