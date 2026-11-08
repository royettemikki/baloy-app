import { prisma } from '@/lib/prisma';

function startOfCurrentMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export async function generateMonthlyDues(period = startOfCurrentMonth()) {
  const billingPeriod = startOfCurrentMonth(period);
  const [settings, homeowners] = await Promise.all([
    prisma.duesSettings.findUnique({ where: { id: 1 } }),
    prisma.homeowner.findMany({
      where: { passwordHash: { not: null } },
      select: {
        id: true,
        lotAreaSqm: true,
        monthlyDuesMode: true,
        monthlyDuesRate: true,
        duesRateOverride: true,
      },
    }),
  ]);

  const monthName = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(billingPeriod);
  const charges = homeowners.flatMap((homeowner) => {
    const mode = homeowner.duesRateOverride ? homeowner.monthlyDuesMode : settings?.monthlyDuesMode ?? 'Fixed';
    const rate = Number(homeowner.duesRateOverride ? homeowner.monthlyDuesRate : settings?.monthlyDuesRate ?? 0);
    const area = Number(homeowner.lotAreaSqm ?? 0);
    const amount = Math.round((mode === 'PerArea' ? rate * area : rate) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) return [];

    return [{
      homeownerId: homeowner.id,
      description: `Monthly assessment · ${monthName}`,
      amount,
      dueDate: billingPeriod,
      billingPeriod,
      status: 'Due' as const,
    }];
  });

  if (charges.length === 0) return { created: 0, eligibleResidents: 0 };

  const result = await prisma.duesCharge.createMany({ data: charges, skipDuplicates: true });
  return { created: result.count, eligibleResidents: homeowners.length };
}

export async function ensureCurrentMonthDues() {
  return generateMonthlyDues();
}
