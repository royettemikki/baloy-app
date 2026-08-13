import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminMobileShell from '@/components/admin/AdminMobileShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string | undefined;
  if (!homeownerId) redirect('/login');

  const homeowner = await prisma.homeowner.findUnique({ where: { id: homeownerId } });
  if (!homeowner?.isAdmin) redirect('/home');

  return (
    <AdminMobileShell fullName={homeowner.fullName} isDev={process.env.NODE_ENV !== 'production'}>
      {children}
    </AdminMobileShell>
  );
}
