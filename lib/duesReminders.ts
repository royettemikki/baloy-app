import { prisma } from '@/lib/prisma';
import { getSmsProvider } from '@/lib/sms';
import { formatPhilippineNumber } from '@/lib/sms/formatPhilippineNumber';
import { organization } from '@/data/mock';

export function buildReminderMessage(homeowner: { fullName: string }, description: string, amount: number, dueDate: Date) {
  return `Hi ${homeowner.fullName.split(' ')[0]}, your ${description} of ₱${amount.toFixed(2)} is due on ${dueDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}. Pay via the ${organization.name} resident app. - ${organization.name}`;
}

export type ReminderOutcome = {
  homeownerName: string;
  status: 'sent' | 'skipped' | 'failed';
  reason?: string;
  message?: string;
};

export async function runDuesReminderCheck(): Promise<{ outcomes: ReminderOutcome[] }> {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const rangeStart = new Date(threeDaysFromNow.setHours(0, 0, 0, 0));
  const rangeEnd = new Date(threeDaysFromNow.setHours(23, 59, 59, 999));

  const charges = await prisma.duesCharge.findMany({
    where: { status: 'Due', reminderSentAt: null, dueDate: { gte: rangeStart, lte: rangeEnd } },
    include: { homeowner: true }
  });

  const provider = getSmsProvider();
  const outcomes: ReminderOutcome[] = [];

  for (const charge of charges) {
    const { homeowner } = charge;

    if (!homeowner.notifyTextDuesReminders) {
      outcomes.push({ homeownerName: homeowner.fullName, status: 'skipped', reason: 'Text reminders turned off' });
      continue;
    }

    const phoneNumber = homeowner.phoneNumber ? formatPhilippineNumber(homeowner.phoneNumber) : null;
    if (!phoneNumber) {
      outcomes.push({ homeownerName: homeowner.fullName, status: 'skipped', reason: 'No valid phone number' });
      continue;
    }

    const message = buildReminderMessage(homeowner, charge.description, Number(charge.amount), charge.dueDate);
    const result = await provider.send(phoneNumber, message);

    if (result.success) {
      await prisma.duesCharge.update({ where: { id: charge.id }, data: { reminderSentAt: new Date() } });
      outcomes.push({ homeownerName: homeowner.fullName, status: 'sent', message });
    } else {
      outcomes.push({ homeownerName: homeowner.fullName, status: 'failed', reason: result.error });
    }
  }

  return { outcomes };
}