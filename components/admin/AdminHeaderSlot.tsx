'use client';

import { usePathname } from 'next/navigation';
import AdminHeader from './AdminHeader';

const TITLES: Record<string, string> = {
  '/admin/invites': 'Residents',
  '/admin/announcements': 'Announcements',
  '/admin/elections': 'Elections',
  '/admin/payments': 'Payments',
  '/admin/dev-tools': 'Dev Tools',
};

export default function AdminHeaderSlot({
  fullName,
  onMenuClick,
}: {
  fullName: string;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  return (
    <AdminHeader
      title={TITLES[pathname] ?? 'Admin'}
      fullName={fullName}
      onMenuClick={onMenuClick}
    />
  );
}
