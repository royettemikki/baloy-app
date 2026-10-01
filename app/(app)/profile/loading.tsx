import Skeleton from '@/components/Skeleton';

export default function ProfileLoading() {
  return (
    <div>
      <div className='flex flex-col items-center mb-[18px]'>
        <Skeleton className='w-16 h-16 rounded-full mb-2.5' />
        <Skeleton className='w-28 h-4 mb-1.5' />
        <Skeleton className='w-36 h-3' />
      </div>
      <Skeleton className='w-16 h-3 mb-1.5' />
      <Skeleton className='w-full h-32 rounded-2xl mb-4' />
      <Skeleton className='w-24 h-3 mb-1.5' />
      <Skeleton className='w-full h-32 rounded-2xl mb-4' />
    </div>
  );
}
