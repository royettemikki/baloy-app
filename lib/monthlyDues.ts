import { prisma } from '@/lib/prisma';

function startOfCurrentMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export async function generateMonthlyDues(period = startOfCurrentMonth()) {
  const billingPeriod = startOfCurrentMonth(period);
  const [settings, properties] = await Promise.all([
    prisma.duesSettings.findUnique({ where: { id: 1 } }),
    prisma.property.findMany({
      where: { homeowners: { some: { passwordHash: { not: null } } } },
      include: {
        homeowners: {
          where: { passwordHash: { not: null } },
          select: { id: true },
        },
      },
    }),
  ]);

  const allResidentIds = properties.flatMap((property) =>
    property.homeowners.map((homeowner) => homeowner.id),
  );
  const existingCharges = await prisma.duesCharge.findMany({
    where: { homeownerId: { in: allResidentIds }, billingPeriod },
    select: { homeownerId: true },
  });
  const billedResidentIds = new Set(existingCharges.map((charge) => charge.homeownerId));

  const monthName = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(billingPeriod);
  const charges = properties.flatMap((property) => {
    const homeowner = property.homeowners.find((resident) => resident.id === property.primaryVoterId)
      ?? property.homeowners[0];
    if (!homeowner || property.homeowners.some((resident) => billedResidentIds.has(resident.id))) {
      return [];
    }

    const mode = property.duesRateOverride ? property.monthlyDuesMode : settings?.monthlyDuesMode ?? 'Fixed';
    const rate = Number(property.duesRateOverride ? property.monthlyDuesRate : settings?.monthlyDuesRate ?? 0);
    const area = Number(property.lotAreaSqm ?? 0);
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

  if (charges.length === 0) return { created: 0, eligibleResidents: properties.length };

  const result = await prisma.duesCharge.createMany({ data: charges, skipDuplicates: true });
  return { created: result.count, eligibleResidents: properties.length };
}

export async function ensureCurrentMonthDues() {
  return generateMonthlyDues();
}
