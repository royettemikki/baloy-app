'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeaderSlot from './AdminHeaderSlot';

export default function AdminMobileShell({
  fullName,
  isDev,
  children,
}: {
  fullName: string;
  isDev: boolean;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <AdminSidebar isDev={isDev} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeaderSlot fullName={fullName} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
