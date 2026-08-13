'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';

import { runDuesReminderCheck, buildReminderMessage } from '@/lib/duesReminders';
import { getSmsProvider } from '@/lib/sms';
import { formatPhilippineNumber } from '@/lib/sms/formatPhilippineNumber';

function isDevEnvironment() {
  return process.env.NODE_ENV !== 'production';
}

async function requireDevAdmin() {
  if (!isDevEnvironment()) return null;
  return getAdminOrNull();
}

export async function resetElectionSeedAction() {
  const admin = await requireDevAdmin();
  if (!admin) return { error: 'This tool is only available in local development.' };

  await prisma.vote.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.position.deleteMany({});
  await prisma.slate.deleteMany({});
  await prisma.election.deleteMany({});

  const election = await prisma.election.create({
    data: {
      title: '2026 Board Election',
      closesAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      slates: {
        create: [
          { name: 'Unity Team', color: '#0F6E56' },
          { name: 'Kapit-Bisig Slate', color: '#B45309' },
        ],
      },
    },
  });

  const slates = await prisma.slate.findMany({ where: { electionId: election.id } });
  const unity = slates.find((s) => s.name === 'Unity Team')!;
  const kapitBisig = slates.find((s) => s.name === 'Kapit-Bisig Slate')!;

  await prisma.position.create({
    data: {
      electionId: election.id,
      title: 'President',
      seats: 1,
      candidates: {
        create: [
          {
            name: 'Renata Osei',
            roleDescription: 'Unit 6C',
            ballotNumber: 1,
            isIncumbent: true,
            slateId: unity.id,
          },
          {
            name: 'Marcus Ibarra',
            roleDescription: 'Unit 21A',
            ballotNumber: 2,
            slateId: kapitBisig.id,
          },
        ],
      },
    },
  });

  await prisma.position.create({
    data: {
      electionId: election.id,
      title: 'Vice President',
      seats: 1,
      candidates: {
        create: [
          {
            name: 'Priya Chandran',
            roleDescription: 'Unit 9D',
            ballotNumber: 1,
            slateId: unity.id,
          },
          { name: 'Owen Fletcher', roleDescription: 'Unit 3B', ballotNumber: 2 },
        ],
      },
    },
  });

  revalidatePath('/vote');
  revalidatePath('/home');
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
