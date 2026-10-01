'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function updateProfileAction(data: {
  fullName: string;
  phoneNumber: string;
  emergencyContact: string;
  notifyEmailAnnouncements: boolean;
  notifyTextDuesReminders: boolean;
  notifyElectionAlerts: boolean;
}) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return { error: 'You must be signed in.' };

  await prisma.homeowner.update({
    where: { id: homeownerId },
    data: {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber || null,
      emergencyContact: data.emergencyContact || null,
      notifyEmailAnnouncements: data.notifyEmailAnnouncements,
      notifyTextDuesReminders: data.notifyTextDuesReminders,
      notifyElectionAlerts: data.notifyElectionAlerts,
    },
  });

  return { success: true };
}
