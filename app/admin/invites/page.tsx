import { prisma } from '@/lib/prisma';
import NewInviteButton from '@/components/admin/residents/NewInviteButton';
import ImportResidentsButton from '@/components/admin/residents/ImportResidentsButton';
import ResidentsTable from '@/components/admin/residents/ResidentsTable';
import CommunityDuesSettings from '@/components/admin/residents/CommunityDuesSettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function InvitesPage() {
  const session = await getServerSession(authOptions);
  const currentAdminId = (session?.user as any)?.id as string;

  const [homeowners, duesSettings, allProperties] = await Promise.all([
    prisma.homeowner.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        property: true,
        propertyMemberships: { select: { propertyId: true } },
        primaryForProperty: { select: { id: true } },
      },
    }),
    prisma.duesSettings.findUnique({ where: { id: 1 } }),
    prisma.property.findMany({ orderBy: { unit: 'asc' } }),
  ]);
  const communityMode = duesSettings?.monthlyDuesMode ?? 'Fixed';
  const communityRate = Number(duesSettings?.monthlyDuesRate ?? 0);
  const properties = allProperties;

  const serialized = homeowners.map((h) => ({
    id: h.id,
    propertyId: h.propertyId,
    propertyNeedsReview: h.property.needsReview,
    isPrimaryOwner: h.primaryForProperty.length > 0,
    propertyMembershipIds: h.propertyMemberships.map((membership) => membership.propertyId),
    primaryPropertyIds: h.primaryForProperty.map((property) => property.id),
    fullName: h.fullName,
    email: h.email,
    unit: h.unit,
    passwordHash: h.passwordHash,
    inviteToken: h.inviteToken,
    invitedAt: h.invitedAt?.toISOString() ?? null,
    createdAt: h.createdAt.toISOString(),
    isAdmin: h.isAdmin,
    lotAreaSqm: h.property.lotAreaSqm === null ? null : Number(h.property.lotAreaSqm),
    monthlyDuesMode: h.property.duesRateOverride ? h.property.monthlyDuesMode : communityMode,
    monthlyDuesRate: h.property.duesRateOverride
      ? Number(h.property.monthlyDuesRate)
      : communityRate,
    duesRateOverride: h.property.duesRateOverride,
  }));

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-strong">
            Community directory
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Residents
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Manage resident accounts, invitations, access, and monthly dues rates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportResidentsButton requiresLotArea={communityMode === 'PerArea'} />
          <NewInviteButton requiresLotArea={communityMode === 'PerArea'} />
        </div>
      </header>
      <CommunityDuesSettings
        mode={communityMode}
        rate={communityRate}
        overrideCount={properties.filter((property) => property.duesRateOverride).length}
        missingAreaCount={
          properties.filter((property) => {
            const mode = property.duesRateOverride ? property.monthlyDuesMode : communityMode;
            return mode === 'PerArea' && !property.lotAreaSqm;
          }).length
        }
      />
      <p className="-mt-2 text-xs text-ink-muted">
        Dues settings are shared by everyone linked to a property. Link an owner to each applicable
        property. The first resident invited to an unassigned property becomes its primary owner;
        CSV imports use the Primary Owner column to identify one owner per unit. Monthly assessments
        are created on the first of each month.
      </p>
      <ResidentsTable
        homeowners={serialized}
        currentAdminId={currentAdminId}
        propertyOptions={properties.map(({ id, unit }) => ({ id, unit }))}
      />
    </div>
  );
}
