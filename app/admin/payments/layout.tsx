import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function PaymentsLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('payments', 'admin');
  return children;
}
