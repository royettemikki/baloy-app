import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileForm from '@/components/ProfileForm';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const homeowner = await prisma.homeowner.findUniqueOrThrow({
    where: { id: homeownerId },
  });

  return (
    <ProfileForm
      profile={{
        fullName: homeowner.fullName,
        unit: homeowner.unit,
        email: homeowner.email,
        phoneNumber: homeowner.phoneNumber ?? '',
        emergencyContact: homeowner.emergencyContact ?? '',
        ownerSince: (homeowner.joinedAt ?? homeowner.createdAt).getFullYear(),
        notifyEmailAnnouncements: homeowner.notifyEmailAnnouncements,
        notifyTextDuesReminders: homeowner.notifyTextDuesReminders,
        notifyElectionAlerts: homeowner.notifyElectionAlerts,
      }}
    />
  );
}
