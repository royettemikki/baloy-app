import Screen from '@/components/Screen';
import BottomNav from '@/components/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Screen>
      <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-28 pt-5 sm:px-7 lg:px-10 lg:pb-28 lg:pt-8">
        <div className="resident-content mx-auto w-full max-w-5xl">{children}</div>
      </main>
      <BottomNav />
    </Screen>
  );
}
