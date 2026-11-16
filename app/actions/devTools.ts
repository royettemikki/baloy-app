'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';

import { runDuesReminderCheck, buildReminderMessage } from '@/lib/duesReminders';
import { getSmsProvider } from '@/lib/sms';
import { formatPhilippineNumber } from '@/lib/sms/formatPhilippineNumber';
import { runLateFeeCheck } from '@/lib/lateFees';
import bcrypt from 'bcryptjs';
import { FEATURE_VISIBILITY } from '@/lib/featureVisibilityConfig';
import type { FeatureAudience, FeatureKey } from '@/lib/featureVisibilityConfig';

const ELECTION_REVALIDATE_PATHS = [
  '/admin/elections',
  '/vote',
  '/results',
  '/file-candidacy',
  '/board',
  '/board-approvals',
  '/expense-requests',
  '/home',
] as const;

async function clearElectionRecords() {
  await prisma.$transaction([
    prisma.vote.deleteMany({}),
    prisma.propertyBallot.deleteMany({}),
    prisma.expenseRequest.deleteMany({}),
    prisma.candidacyFiling.deleteMany({}),
    prisma.candidate.deleteMany({}),
    prisma.position.deleteMany({}),
    prisma.slate.deleteMany({}),
    prisma.election.deleteMany({}),
  ]);
}

export async function runLateFeeCheckNowAction() {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };

  const { outcomes } = await runLateFeeCheck();
  return { success: true, outcomes };
}

function isDevEnvironment() {
  return process.env.NODE_ENV !== 'production';
}

async function requireDevAdmin() {
  if (!isDevEnvironment()) return null;
  return getAdminOrNull();
}

export async function resetElectionDataAction() {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };

  await clearElectionRecords();
  revalidateElectionPaths();
  return { success: true };
}

function revalidateElectionPaths() {
  ELECTION_REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
}

export async function updateFeatureVisibilityAction(
  key: FeatureKey,
  audience: FeatureAudience,
  enabled: boolean,
) {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };
  if (
    typeof enabled !== 'boolean' ||
    (audience !== 'admin' && audience !== 'resident') ||
    typeof key !== 'string'
  ) {
    return { error: 'Invalid feature visibility setting.' };
  }

  const feature = FEATURE_VISIBILITY.find((item) => item.key === key);
  if (!feature?.[audience]) return { error: 'Unknown feature or audience.' };

  await prisma.appFeatureVisibility.upsert({
    where: { key },
    create: {
      key,
      adminEnabled: audience === 'admin' ? enabled : true,
      residentEnabled: audience === 'resident' ? enabled : true,
    },
    update: audience === 'admin' ? { adminEnabled: enabled } : { residentEnabled: enabled },
  });

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function reseedAnnouncementsAction() {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };

  await prisma.announcement.deleteMany({});
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Pool closed for resurfacing',
        body: 'The main pool will be closed July 24 to 26 while the deck is resealed. The kiddie pool stays open.',
        tag: 'Maintenance',
        pinned: true,
        postedBy: 'Facilities',
      },
      {
        title: 'Summer block party, Saturday August 9',
        body: 'Grills go up at 4pm in the north lot. Sign up at the clubhouse to bring a dish or lend a table.',
        tag: 'Event',
        pinned: false,
        postedBy: 'Social committee',
      },
      {
        title: 'Gate code changing August 1',
        body: 'The Birchwood entrance code changes at the start of August. New codes go out by email.',
        tag: 'Safety',
        pinned: false,
        postedBy: 'Security committee',
      },
      {
        title: 'July board meeting minutes posted',
        body: 'Minutes from July 10 are up in the documents library, including the reserve fund review.',
        tag: 'Board',
        pinned: false,
        postedBy: 'Board secretary',
      },
    ],
  });

  revalidatePath('/notices');
  revalidatePath('/home');
  revalidatePath('/admin/announcements');
  return { success: true };
}

export async function reseedDuesAction() {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };

  const homeowners = await prisma.homeowner.findMany();
  let seededCount = 0;

  for (const owner of homeowners) {
    const existing = await prisma.duesCharge.count({ where: { homeownerId: owner.id } });
    if (existing > 0) continue;

    await prisma.duesCharge.createMany({
      data: [
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-05-01'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Roof reserve — special',
          amount: 120,
          dueDate: new Date('2026-05-15'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-06-01'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-07-01'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-08-01'),
          status: 'Due',
        },
      ],
    });
    seededCount++;
  }

  revalidatePath('/dues');
  revalidatePath('/home');
  return { success: true, seededCount };
}

export async function resetDuesAction() {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };

  await prisma.payment.deleteMany({});
  await prisma.duesCharge.deleteMany({});

  const homeowners = await prisma.homeowner.findMany();
  for (const owner of homeowners) {
    await prisma.duesCharge.createMany({
      data: [
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-05-01'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Roof reserve — special',
          amount: 120,
          dueDate: new Date('2026-05-15'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-06-01'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-07-01'),
          status: 'Paid',
        },
        {
          homeownerId: owner.id,
          description: 'Monthly assessment',
          amount: 245,
          dueDate: new Date('2026-08-01'),
          status: 'Due',
        },
      ],
    });
  }

  revalidatePath('/dues');
  revalidatePath('/home');
  revalidatePath('/admin/payments');
  return { success: true, seededCount: homeowners.length };
}

export async function listResidentsForSmsTestAction() {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };

  const homeowners = await prisma.homeowner.findMany({
    where: { passwordHash: { not: null } },
    select: { id: true, fullName: true, phoneNumber: true },
    orderBy: { fullName: 'asc' },
  });

  return { success: true, homeowners };
}

export async function sendTestReminderAction(homeownerId: string) {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };

  const homeowner = await prisma.homeowner.findUnique({ where: { id: homeownerId } });
  if (!homeowner) return { error: 'Resident not found.' };

  const phoneNumber = homeowner.phoneNumber ? formatPhilippineNumber(homeowner.phoneNumber) : null;
  if (!phoneNumber)
    return { error: `${homeowner.fullName} has no valid Philippine phone number saved.` };

  const dueCharge = await prisma.duesCharge.findFirst({
    where: { homeownerId, status: 'Due' },
    orderBy: { dueDate: 'asc' },
  });

  const description =
    dueCharge?.description ?? 'Monthly assessment (sample — no real Due charge found)';
  const amount = dueCharge ? Number(dueCharge.amount) : 245;
  const dueDate = dueCharge?.dueDate ?? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const message = buildReminderMessage(homeowner, description, amount, dueDate);
  const result = await getSmsProvider().send(phoneNumber, message);

  if (!result.success) return { error: result.error };
  return { success: true, message, phoneNumber, usedRealCharge: !!dueCharge };
}

export async function runReminderCheckNowAction() {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };

  const { outcomes } = await runDuesReminderCheck();
  return { success: true, outcomes };
}

export async function listAllResidentsAction() {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };

  const homeowners = await prisma.homeowner.findMany({
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: 'asc' },
  });

  return { success: true, homeowners };
}

export async function setTestPasswordAction(homeownerId: string, newPassword: string) {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };
  if (!newPassword || newPassword.length < 8)
    return { error: 'Password must be at least 8 characters.' };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.homeowner.update({ where: { id: homeownerId }, data: { passwordHash } });

  return { success: true };
}
