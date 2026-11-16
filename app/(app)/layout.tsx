import Screen from '@/components/Screen';
import BottomNav from '@/components/BottomNav';
import { getEnabledFeatureKeys } from '@/lib/featureVisibility';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const enabledFeatures = await getEnabledFeatureKeys('resident');

  return (
    <Screen>
      <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-7 sm:pb-32 sm:pt-7 lg:px-10 lg:pb-32 lg:pt-8">
        <div className="resident-content mx-auto w-full max-w-5xl">{children}</div>
      </main>
      <BottomNav enabledFeatures={enabledFeatures} />
    </Screen>
  );
}
