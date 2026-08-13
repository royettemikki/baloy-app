import { prisma } from '@/lib/prisma';
import NewInviteButton from '@/components/admin/residents/NewInviteButton';
import ResidentsTable from '@/components/admin/residents/ResidentsTable';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function InvitesPage() {
  const session = await getServerSession(authOptions);
  const currentAdminId = (session?.user as any)?.id as string;

  const homeowners = await prisma.homeowner.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const serialized = homeowners.map((h) => ({
    id: h.id,
    fullName: h.fullName,
    email: h.email,
    unit: h.unit,
    passwordHash: h.passwordHash,
    inviteToken: h.inviteToken,
    invitedAt: h.invitedAt?.toISOString() ?? null,
    createdAt: h.createdAt.toISOString(),
    isAdmin: h.isAdmin,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          Create invite links for new residents and track who's joined.
        </p>
        <NewInviteButton />
      </div>
      <ResidentsTable homeowners={serialized} currentAdminId={currentAdminId} />
    </div>
  );
}
