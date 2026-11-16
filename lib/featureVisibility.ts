import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { FEATURE_VISIBILITY } from '@/lib/featureVisibilityConfig';
import type {
  FeatureAudience,
  FeatureKey,
  FeatureVisibilityState,
} from '@/lib/featureVisibilityConfig';

export { FEATURE_VISIBILITY } from '@/lib/featureVisibilityConfig';
export type {
  FeatureAudience,
  FeatureKey,
  FeatureVisibilityState,
} from '@/lib/featureVisibilityConfig';

export async function getFeatureVisibilityState(): Promise<FeatureVisibilityState> {
  const rows = await prisma.appFeatureVisibility.findMany();
  const stored = new Map(rows.map((row) => [row.key, row]));

  return Object.fromEntries(
    FEATURE_VISIBILITY.map(({ key }) => {
      const row = stored.get(key);
      return [key, { admin: row?.adminEnabled ?? true, resident: row?.residentEnabled ?? true }];
    }),
  ) as FeatureVisibilityState;
}

export async function getEnabledFeatureKeys(audience: FeatureAudience): Promise<FeatureKey[]> {
  const settings = await getFeatureVisibilityState();
  return FEATURE_VISIBILITY.filter(
    (feature) => feature[audience] && settings[feature.key][audience],
  ).map((feature) => feature.key);
}

export async function requireFeatureEnabled(key: FeatureKey, audience: FeatureAudience) {
  const feature = FEATURE_VISIBILITY.find((item) => item.key === key);
  if (!feature?.[audience]) redirect(audience === 'admin' ? '/admin' : '/home');

  const row = await prisma.appFeatureVisibility.findUnique({ where: { key } });
  if (row && !row[audience === 'admin' ? 'adminEnabled' : 'residentEnabled']) {
    redirect(audience === 'admin' ? '/admin' : '/home');
  }
}
