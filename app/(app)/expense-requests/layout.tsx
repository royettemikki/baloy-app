import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function ExpenseRequestsLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('expenses', 'resident');
  return children;
}
