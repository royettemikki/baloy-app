import { requireFeatureEnabled } from '@/lib/featureVisibility';

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  await requireFeatureEnabled('reports', 'admin');
  return children;
}
