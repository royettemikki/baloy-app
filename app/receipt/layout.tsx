import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function ReceiptLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('payments', 'resident');
  return children;
}
