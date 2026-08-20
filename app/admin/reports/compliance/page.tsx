import { prisma } from '@/lib/prisma';
import ReportTabs from '@/app/admin/reports/ReportTabs';
import ComplianceTable from '@/app/admin/reports/ComplianceTable';

export default async function ComplianceReportPage() {
  const homeowners = await prisma.homeowner.findMany({
    where: { passwordHash: { not: null } },
    include: { duesCharges: { where: { status: { not: 'Paid' } } } },
    orderBy: { fullName: 'asc' },
  });

  const rows = homeowners
    .map((h) => {
      const owed = h.duesCharges.reduce(
        (sum, c) => sum + (Number(c.amount) - Number(c.amountPaid)),
        0,
      );
      const hasOverdue = h.duesCharges.some((c) => c.status === 'Overdue');
      const status: 'Paid up' | 'Overdue' | 'Outstanding' =
        owed <= 0 ? 'Paid up' : hasOverdue ? 'Overdue' : 'Outstanding';
      return { id: h.id, fullName: h.fullName, unit: h.unit, email: h.email, owed, status };
    })
    .sort((a, b) => b.owed - a.owed);

  return (
    <div>
      <ReportTabs active="compliance" />
      <div className="mt-6">
        <ComplianceTable rows={rows} />
      </div>
    </div>
  );
}
