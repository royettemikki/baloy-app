export const FEATURE_VISIBILITY = [
  { key: 'announcements', label: 'Announcements / Notices', admin: true, resident: true },
  { key: 'elections', label: 'Elections', admin: true, resident: true },
  { key: 'residents', label: 'Residents', admin: true, resident: false },
  { key: 'payments', label: 'Payments / Dues', admin: true, resident: true },
  { key: 'expenses', label: 'Expenses', admin: true, resident: true },
  { key: 'reports', label: 'Reports', admin: true, resident: false },
  { key: 'profile', label: 'Profile', admin: false, resident: true },
  { key: 'board', label: 'Board', admin: false, resident: true },
] as const;

export type FeatureKey = (typeof FEATURE_VISIBILITY)[number]['key'];
export type FeatureAudience = 'admin' | 'resident';
export type FeatureVisibilityState = Record<FeatureKey, { admin: boolean; resident: boolean }>;
