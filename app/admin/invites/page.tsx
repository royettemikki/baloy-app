import { prisma } from '@/lib/prisma';
import NewInviteButton from '@/components/admin/residents/NewInviteButton';
import ResidentsTable from '@/components/admin/residents/ResidentsTable';
import CommunityDuesSettings from '@/components/admin/residents/CommunityDuesSettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function InvitesPage() {
  const session = await getServerSession(authOptions);
  const currentAdminId = (session?.user as any)?.id as string;

  const [homeowners, duesSettings] = await Promise.all([
    prisma.homeowner.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.duesSettings.findUnique({ where: { id: 1 } }),
  ]);
  const communityMode = duesSettings?.monthlyDuesMode ?? 'Fixed';
  const communityRate = Number(duesSettings?.monthlyDuesRate ?? 0);

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
    lotAreaSqm: h.lotAreaSqm === null ? null : Number(h.lotAreaSqm),
    monthlyDuesMode: h.duesRateOverride ? h.monthlyDuesMode : communityMode,
    monthlyDuesRate: h.duesRateOverride ? Number(h.monthlyDuesRate) : communityRate,
    duesRateOverride: h.duesRateOverride,
  }));

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-strong">Community directory</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-3xl">Residents</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Manage resident accounts, invitations, access, and monthly dues rates.
          </p>
        </div>
        <NewInviteButton requiresLotArea={communityMode === 'PerArea'} />
      </header>
      <CommunityDuesSettings
        mode={communityMode}
        rate={communityRate}
        overrideCount={homeowners.filter((h) => h.duesRateOverride).length}
        missingAreaCount={homeowners.filter((h) => (!h.duesRateOverride || h.monthlyDuesMode === 'PerArea') && !h.lotAreaSqm).length}
      />
      <p className="-mt-2 text-xs text-ink-muted">
        Per-resident exceptions can be set from <span className="font-semibold text-ink-soft">Actions → Edit details</span>. Monthly assessments are created on the first of each month.
      </p>
      <ResidentsTable homeowners={serialized} currentAdminId={currentAdminId} />
    </div>
  );
}
