import Screen from '@/components/Screen';
import BottomNav from '@/components/BottomNav';
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Screen>
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-2 pt-5">{children}</div>
      <BottomNav />
    </Screen>
  );
}
