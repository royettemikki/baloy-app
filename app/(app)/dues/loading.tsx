import Skeleton from '@/components/Skeleton';

export default function DuesLoading() {
  return (
    <div>
      <Skeleton className='w-16 h-5 mb-3.5' />
      <Skeleton className='w-full h-32 rounded-2xl mb-3.5' />
      <Skeleton className='w-16 h-3.5 mb-2' />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className='flex items-center justify-between py-2.5 border-t border-line'
        >
          <div>
            <Skeleton className='w-28 h-3.5 mb-1.5' />
            <Skeleton className='w-20 h-3' />
          </div>
          <div className='text-right'>
            <Skeleton className='w-14 h-3.5 mb-1.5 ml-auto' />
            <Skeleton className='w-12 h-3 ml-auto' />
          </div>
        </div>
      ))}
    </div>
  );
}
