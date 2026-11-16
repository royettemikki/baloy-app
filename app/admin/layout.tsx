import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminMobileShell from '@/components/admin/AdminMobileShell';
import { getEnabledFeatureKeys } from '@/lib/featureVisibility';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string | undefined;
  if (!homeownerId) redirect('/login');

  const homeowner = await prisma.homeowner.findUnique({ where: { id: homeownerId } });
  if (!homeowner?.isAdmin) redirect('/home');

  const [pendingInvites, pendingPayments, pendingExpenses, enabledFeatures] = await Promise.all([
    prisma.homeowner.count({ where: { passwordHash: null } }),
    prisma.payment.count({ where: { status: 'Submitted' } }),
    prisma.expenseRequest.count({ where: { status: 'Pending' } }),
    getEnabledFeatureKeys('admin'),
  ]);

  return (
    <AdminMobileShell
      fullName={homeowner.fullName}
      isDev={process.env.NODE_ENV !== 'production'}
      enabledFeatures={enabledFeatures}
      counts={{ pendingInvites, pendingPayments, pendingExpenses }}
    >
      {children}
    </AdminMobileShell>
  );
}
