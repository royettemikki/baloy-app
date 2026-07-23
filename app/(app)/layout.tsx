import Screen from '@/components/Screen';
import BottomNav from '@/components/BottomNav';
import Providers from './providers';
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Screen>
      <div className='flex-1 px-5 pt-5 pb-2 overflow-y-auto'>
        <Providers>{children}</Providers>
      </div>
      <BottomNav />
    </Screen>
  );
}
