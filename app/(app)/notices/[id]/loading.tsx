import Skeleton from '@/components/Skeleton';

export default function AnnouncementDetailLoading() {
  return (
    <div>
      <Skeleton className='w-16 h-4 mb-4' />
      <Skeleton className='w-11 h-11 rounded-xl mb-3' />
      <Skeleton className='w-3/4 h-5 mb-1.5' />
      <Skeleton className='w-40 h-3 mb-4' />
      <Skeleton className='w-full h-3 mb-2' />
      <Skeleton className='w-full h-3 mb-2' />
      <Skeleton className='w-2/3 h-3' />
    </div>
  );
}
