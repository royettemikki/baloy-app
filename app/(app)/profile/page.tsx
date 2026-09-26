import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileForm from '@/components/ProfileForm';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string | undefined;

  if (!homeownerId) {
    redirect('/login');
  }

  const homeowner = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
  });

  if (!homeowner) {
    // Session refers to a homeowner that no longer exists — force re-login
    redirect('/api/auth/signout?callbackUrl=/login');
  }

  return (
    <div>
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
    </div>
  );
}
