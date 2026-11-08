import { prisma } from '@/lib/prisma';

function getLateFeePercent() {
  return Number(process.env.LATE_FEE_PERCENT ?? '2');
}

export type LateFeeOutcome = {
  homeownerName: string;
  chargeDescription: string;
  feeAmount: number;
};

export async function runLateFeeCheck(): Promise<{ outcomes: LateFeeOutcome[] }> {
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const percent = getLateFeePercent();

  const overdueCharges = await prisma.duesCharge.findMany({
    where: { status: 'Due', dueDate: { lt: startOfToday }, lateFeeAppliedAt: null },
    include: { homeowner: true },
  });

  const outcomes: LateFeeOutcome[] = [];

  for (const charge of overdueCharges) {
    const feeAmount = Math.round(Number(charge.amount) * (percent / 100) * 100) / 100;

    const applied = await prisma.$transaction(async (tx) => {
      // Claim the charge conditionally so overlapping cron runs cannot add the
      // same late fee twice.
      const claim = await tx.duesCharge.updateMany({
        where: {
          id: charge.id,
          status: 'Due',
          dueDate: { lt: startOfToday },
          lateFeeAppliedAt: null,
        },
        data: { status: 'Overdue', lateFeeAppliedAt: now },
      });
      if (claim.count !== 1) return false;

      await tx.duesCharge.create({
        data: {
          homeownerId: charge.homeownerId,
          description: `Late fee — ${charge.description}`,
          amount: feeAmount,
          dueDate: now,
          status: 'Due',
        },
      });
      return true;
    });

    if (!applied) continue;

    outcomes.push({
      homeownerName: charge.homeowner.fullName,
      chargeDescription: charge.description,
      feeAmount,
    });
  }

  return { outcomes };
}
