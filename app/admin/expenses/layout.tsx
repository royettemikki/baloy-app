import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function ExpensesLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('expenses', 'admin');
  return children;
}
