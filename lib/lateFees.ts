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
  const percent = getLateFeePercent();

  const overdueCharges = await prisma.duesCharge.findMany({
    where: { status: 'Due', dueDate: { lt: now }, lateFeeAppliedAt: null },
    include: { homeowner: true },
  });

  const outcomes: LateFeeOutcome[] = [];

  for (const charge of overdueCharges) {
    const feeAmount = Math.round(Number(charge.amount) * (percent / 100) * 100) / 100;

    await prisma.$transaction([
      prisma.duesCharge.update({
        where: { id: charge.id },
        data: { status: 'Overdue', lateFeeAppliedAt: now },
      }),
      prisma.duesCharge.create({
        data: {
          homeownerId: charge.homeownerId,
          description: `Late fee — ${charge.description}`,
          amount: feeAmount,
          dueDate: now,
          status: 'Due',
        },
      }),
    ]);

    outcomes.push({
      homeownerName: charge.homeowner.fullName,
      chargeDescription: charge.description,
      feeAmount,
    });
  }

  return { outcomes };
}
