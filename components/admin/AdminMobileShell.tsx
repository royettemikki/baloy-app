'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeaderSlot from './AdminHeaderSlot';

type Counts = {
  pendingInvites: number;
  pendingPayments: number;
  pendingExpenses: number;
};

export default function AdminMobileShell({
  fullName,
  isDev,
  counts,
  children,
}: {
  fullName: string;
  isDev: boolean;
  counts: Counts;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDashboard = usePathname() === '/admin';

  return (
    <div className={`flex min-h-screen ${isDashboard ? 'dashboard-bg' : ''}`}>
      <AdminSidebar
        isDev={isDev}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        counts={counts}
      />
      <div className={`flex min-w-0 flex-1 flex-col md:ml-[240px] ${isDashboard ? 'bg-transparent' : 'bg-surface-muted'}`}>
        <AdminHeaderSlot fullName={fullName} onMenuClick={() => setMobileOpen(true)} />
        <main className={`flex-1 px-4 py-6 md:px-8 md:py-8 ${isDashboard ? 'bg-transparent' : ''}`}>
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
