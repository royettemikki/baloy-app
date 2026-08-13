import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeaderSlot from '@/components/admin/AdminHeaderSlot';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string | undefined;
  if (!homeownerId) redirect('/login');

  const homeowner = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
  });
  if (!homeowner?.isAdmin) redirect('/home');

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <AdminSidebar isDev={process.env.NODE_ENV !== 'production'} />
      <div className="flex flex-1 flex-col">
        <AdminHeaderSlot fullName={homeowner.fullName} />
        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
