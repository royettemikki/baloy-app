'use client';

import { useAutoRefresh } from '@/hooks/useAutoRefresh';

export default function AutoRefresh({ intervalMs }: { intervalMs?: number } = {}) {
  useAutoRefresh(intervalMs);
  return null;
}
