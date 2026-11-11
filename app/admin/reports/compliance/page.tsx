import { prisma } from '@/lib/prisma';
import ReportTabs from '@/app/admin/reports/ReportTabs';
import ComplianceTable from '@/app/admin/reports/ComplianceTable';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function ComplianceReportPage() {
  const properties = await prisma.property.findMany({
    where: { homeowners: { some: { passwordHash: { not: null } } } },
    include: {
      homeowners: {
        where: { passwordHash: { not: null } },
        include: { duesCharges: { where: { status: { not: 'Paid' } } } },
        orderBy: { fullName: 'asc' },
      },
    },
  });

  const rows = properties
    .map((property) => {
      const representative =
        property.homeowners.find((homeowner) => homeowner.id === property.primaryVoterId) ??
        property.homeowners[0];
      if (!representative) return null;
      const charges = property.homeowners.flatMap((homeowner) => homeowner.duesCharges);
      const owed = charges.reduce(
        (sum, c) => sum + (Number(c.amount) - Number(c.amountPaid)),
        0,
      );
      const hasOverdue = charges.some((c) => c.status === 'Overdue');
      const status: 'Paid up' | 'Overdue' | 'Outstanding' =
        owed <= 0 ? 'Paid up' : hasOverdue ? 'Overdue' : 'Outstanding';
      return {
        id: property.id,
        fullName: representative.fullName,
        unit: property.unit,
        email: representative.email,
        owed,
        status,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.owed - a.owed);

  return (
    <div>
      <AdminPageHeader
        title="Dues compliance"
        description="Review outstanding balances and overdue resident accounts."
        eyebrow="Reports"
      />
      <ReportTabs active="compliance" />
      <div className="mt-6">
        <ComplianceTable rows={rows} />
      </div>
    </div>
  );
}
