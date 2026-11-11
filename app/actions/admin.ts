'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';
import { MAX_RESIDENT_IMPORT_ROWS, prepareResidentImportRows } from '@/lib/residentImport';
import type { ResidentImportInputRow } from '@/lib/residentImport';
import { normalizePropertyUnit } from '@/lib/propertyUnit';

function isResidentImportInput(rows: unknown): rows is ResidentImportInputRow[] {
  return (
    Array.isArray(rows) &&
    rows.length > 0 &&
    rows.length <= MAX_RESIDENT_IMPORT_ROWS &&
    rows.every(
      (row) =>
        row &&
        Number.isSafeInteger(row.rowNumber) &&
        row.rowNumber > 1 &&
        typeof row.fullName === 'string' &&
        typeof row.email === 'string' &&
        typeof row.unit === 'string' &&
        typeof row.lotAreaSqm === 'string',
    )
  );
}

async function getResidentImportPreview(rows: ResidentImportInputRow[]) {
  const normalizedUnits = [...new Set(rows.map((row) => normalizePropertyUnit(row.unit)))];
  const [existingResidents, existingProperties, duesSettings] = await Promise.all([
    prisma.homeowner.findMany({
      where: {
        email: { in: rows.map((row) => row.email.trim()), mode: 'insensitive' },
      },
      select: { email: true },
    }),
    prisma.property.findMany({
      where: { normalizedUnit: { in: normalizedUnits } },
      select: {
        normalizedUnit: true,
        lotAreaSqm: true,
        duesRateOverride: true,
        monthlyDuesMode: true,
      },
    }),
    prisma.duesSettings.findUnique({ where: { id: 1 } }),
  ]);
  const existingEmails = new Set(existingResidents.map((resident) => resident.email.toLowerCase()));
  const existingLotAreas = new Map(
    existingProperties.map((property) => [
      property.normalizedUnit,
      property.lotAreaSqm === null ? null : Number(property.lotAreaSqm),
    ]),
  );
  const communityDuesMode = duesSettings?.monthlyDuesMode ?? 'Fixed';
  const unitsRequiringLotArea = new Set(
    normalizedUnits.filter((unit) => {
      const property = existingProperties.find((item) => item.normalizedUnit === unit);
      return property?.duesRateOverride
        ? property.monthlyDuesMode === 'PerArea'
        : communityDuesMode === 'PerArea';
    }),
  );
  return prepareResidentImportRows(rows, existingEmails, unitsRequiringLotArea, existingLotAreas);
}

export async function previewResidentsImportAction(rows: ResidentImportInputRow[]) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!isResidentImportInput(rows)) {
    return {
      error: `Import between 1 and ${MAX_RESIDENT_IMPORT_ROWS} valid resident rows.`,
    };
  }

  const preparedRows = await getResidentImportPreview(rows);
  return {
    success: true,
    rows: preparedRows,
    validCount: preparedRows.filter((row) => !row.error).length,
    invalidCount: preparedRows.filter((row) => row.error).length,
  };
}

export async function importResidentsAction(rows: ResidentImportInputRow[]) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!isResidentImportInput(rows)) {
    return {
      error: `Import between 1 and ${MAX_RESIDENT_IMPORT_ROWS} valid resident rows.`,
    };
  }

  const preparedRows = await getResidentImportPreview(rows);
  const validRows = preparedRows.filter((row) => !row.error);
  if (validRows.length === 0) {
    return { error: 'There are no valid residents to import. Review the preview first.' };
  }

  const result = await prisma.$transaction(async (tx) => {
    const properties = new Map<string, { unit: string; lotAreaSqm: number | null }>();
    for (const row of validRows) {
      const normalizedUnit = normalizePropertyUnit(row.unit);
      const currentProperty = properties.get(normalizedUnit);
      if (!currentProperty) {
        properties.set(normalizedUnit, { unit: row.unit, lotAreaSqm: row.lotAreaSqm });
      } else if (currentProperty.lotAreaSqm === null && row.lotAreaSqm !== null) {
        currentProperty.lotAreaSqm = row.lotAreaSqm;
      }
    }

    await tx.property.createMany({
      data: [...properties].map(([normalizedUnit, property]) => ({
        normalizedUnit,
        ...property,
      })),
      skipDuplicates: true,
    });

    const storedProperties = await tx.property.findMany({
      where: { normalizedUnit: { in: [...properties.keys()] } },
      select: { id: true, normalizedUnit: true, unit: true, lotAreaSqm: true },
    });
    for (const property of storedProperties) {
      const requestedArea = properties.get(property.normalizedUnit)?.lotAreaSqm;
      if (property.lotAreaSqm === null && requestedArea !== null && requestedArea !== undefined) {
        await tx.property.update({
          where: { id: property.id },
          data: { lotAreaSqm: requestedArea },
        });
      }
    }
    const propertyByUnit = new Map(
      storedProperties.map((property) => [property.normalizedUnit, property]),
    );
    const created = await tx.homeowner.createMany({
      data: validRows.map((row) => {
        const property = propertyByUnit.get(normalizePropertyUnit(row.unit));
        if (!property) throw new Error('Unable to find the property for an imported resident.');
        return {
          fullName: row.fullName,
          email: row.email,
          unit: property.unit,
          propertyId: property.id,
          lotAreaSqm: row.lotAreaSqm,
          inviteToken: crypto.randomBytes(24).toString('hex'),
          invitedAt: new Date(),
        };
      }),
      skipDuplicates: true,
    });

    return created;
  });

  revalidatePath('/admin/invites');
  return {
    success: true,
    createdCount: result.count,
    skippedCount: validRows.length - result.count,
  };
}

export async function createInviteAction(
  fullName: string,
  unit: string,
  email: string,
  lotAreaInput?: number | null,
) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const normalizedName = fullName.trim();
  const trimmedUnitInput = unit.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedName || normalizedName.length > 120) {
    return { error: 'Enter a name of 120 characters or fewer.' };
  }
  if (!trimmedUnitInput || trimmedUnitInput.length > 40) {
    return { error: 'Enter a unit of 40 characters or fewer.' };
  }
  if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { error: 'Enter a valid email address.' };
  }

  const lotAreaSqm = lotAreaInput ?? null;
  if (
    lotAreaSqm !== null &&
    (!Number.isFinite(lotAreaSqm) || lotAreaSqm <= 0 || lotAreaSqm > 99999999)
  ) {
    return { error: 'Enter a valid lot area greater than zero.' };
  }
  const trimmedUnit = trimmedUnitInput;
  const normalizedUnit = normalizePropertyUnit(trimmedUnit);
  const existingProperty = await prisma.property.findUnique({
    where: { normalizedUnit },
    select: {
      lotAreaSqm: true,
      duesRateOverride: true,
      monthlyDuesMode: true,
    },
  });
  if (lotAreaSqm === null) {
    const duesSettings = await prisma.duesSettings.findUnique({ where: { id: 1 } });
    const duesMode = existingProperty?.duesRateOverride
      ? existingProperty.monthlyDuesMode
      : duesSettings?.monthlyDuesMode;
    if (duesMode === 'PerArea' && existingProperty?.lotAreaSqm == null) {
      return { error: 'Lot area is required because this property is billed by area.' };
    }
  }

  const existing = await prisma.homeowner.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
  });
  if (existing) return { error: 'An account with that email already exists.' };

  const inviteToken = crypto.randomBytes(24).toString('hex');
  if (
    existingProperty?.lotAreaSqm !== null &&
    existingProperty?.lotAreaSqm !== undefined &&
    lotAreaSqm !== null &&
    Number(existingProperty.lotAreaSqm) !== lotAreaSqm
  ) {
    return { error: 'Lot area does not match the existing property record.' };
  }

  await prisma.$transaction(async (tx) => {
    const property = await tx.property.upsert({
      where: { normalizedUnit },
      create: {
        unit: trimmedUnit,
        normalizedUnit,
        lotAreaSqm,
      },
      update: lotAreaSqm !== null && existingProperty?.lotAreaSqm === null ? { lotAreaSqm } : {},
    });
    await tx.homeowner.create({
      data: {
        email: normalizedEmail,
        fullName: normalizedName,
        unit: property.unit,
        propertyId: property.id,
        lotAreaSqm,
        inviteToken,
        invitedAt: new Date(),
      },
    });
  });

  return { success: true, token: inviteToken };
}

export async function updateResidentAction(
  homeownerId: string,
  data: { fullName: string; unit: string; email: string },
) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const fullName = data.fullName.trim();
  const email = data.email.trim().toLowerCase();
  const trimmedUnit = data.unit.trim();
  if (!fullName || fullName.length > 120) {
    return { error: 'Enter a name of 120 characters or fewer.' };
  }
  if (!trimmedUnit || trimmedUnit.length > 40) {
    return { error: 'Enter a unit of 40 characters or fewer.' };
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' };
  }

  const existing = await prisma.homeowner.findFirst({
    where: { email: { equals: email, mode: 'insensitive' }, NOT: { id: homeownerId } },
  });
  if (existing) return { error: 'Another resident already uses that email.' };

  const target = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
    select: { id: true, unit: true, propertyId: true },
  });
  if (!target) return { error: 'Resident not found.' };

  const normalizedUnit = normalizePropertyUnit(trimmedUnit);
  const isMoving = normalizePropertyUnit(target.unit) !== normalizedUnit;
  if (isMoving) {
    const [duesCount, paymentCount, voteCount] = await Promise.all([
      prisma.duesCharge.count({ where: { homeownerId } }),
      prisma.payment.count({ where: { homeownerId } }),
      prisma.vote.count({ where: { homeownerId } }),
    ]);
    if (duesCount || paymentCount || voteCount) {
      return {
        error:
          'This resident has financial or election history and cannot be moved to another property.',
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    const property = isMoving
      ? await tx.property.upsert({
          where: { normalizedUnit },
          create: {
            unit: trimmedUnit,
            normalizedUnit,
            lotAreaSqm: null,
          },
          update: {},
        })
      : await tx.property.findUniqueOrThrow({ where: { id: target.propertyId } });

    await tx.homeowner.update({
      where: { id: homeownerId },
      data: {
        fullName,
        unit: property.unit,
        email,
        propertyId: property.id,
      },
    });

    if (isMoving) {
      const oldProperty = await tx.property.findUniqueOrThrow({
        where: { id: target.propertyId },
        select: { primaryVoterId: true },
      });
      if (oldProperty.primaryVoterId === homeownerId) {
        await tx.property.update({
          where: { id: target.propertyId },
          data: { primaryVoterId: null },
        });
      }
    }
  });

  revalidatePath('/admin/invites');
  return { success: true, propertyChanged: isMoving };
}

export async function updateResidentDuesAction(
  homeownerId: string,
  data: {
    override: boolean;
    mode: 'Fixed' | 'PerArea';
    rate: number;
    lotAreaSqm: number | null;
    reviewedProperty: boolean;
  },
) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (typeof data.override !== 'boolean')
    return { error: 'Choose whether this resident has a custom rate.' };
  if (typeof data.reviewedProperty !== 'boolean')
    return { error: 'Confirm the property setup review.' };
  if (data.override && data.mode !== 'Fixed' && data.mode !== 'PerArea')
    return { error: 'Choose a valid dues method.' };
  if (data.override && (!Number.isFinite(data.rate) || data.rate < 0 || data.rate > 99999999)) {
    return { error: 'Enter a valid monthly rate.' };
  }
  if (
    data.lotAreaSqm !== null &&
    (!Number.isFinite(data.lotAreaSqm) || data.lotAreaSqm <= 0 || data.lotAreaSqm > 99999999)
  ) {
    return { error: 'Enter a valid lot area greater than zero.' };
  }
  if (data.override && data.mode === 'PerArea' && data.lotAreaSqm === null) {
    return { error: 'Lot area is required for area-based dues.' };
  }
  if (!data.override && data.lotAreaSqm === null) {
    const communitySettings = await prisma.duesSettings.findUnique({ where: { id: 1 } });
    if (communitySettings?.monthlyDuesMode === 'PerArea') {
      return { error: 'Lot area is required for the community area-based rate.' };
    }
  }

  const target = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
    select: { propertyId: true },
  });
  if (!target) return { error: 'Resident not found.' };

  await prisma.property.update({
    where: { id: target.propertyId },
    data: {
      duesRateOverride: data.override,
      lotAreaSqm: data.lotAreaSqm === null ? null : Math.round(data.lotAreaSqm * 100) / 100,
      ...(data.reviewedProperty ? { needsReview: false } : {}),
      ...(data.override
        ? {
            monthlyDuesMode: data.mode,
            monthlyDuesRate: Math.round(data.rate * 100) / 100,
          }
        : {}),
    },
  });

  revalidatePath('/admin/invites');
  revalidatePath('/dues');
  revalidatePath('/home');
  return { success: true };
}

export async function updateCommunityDuesAction(data: { mode: 'Fixed' | 'PerArea'; rate: number }) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (data.mode !== 'Fixed' && data.mode !== 'PerArea')
    return { error: 'Choose a valid dues method.' };
  if (!Number.isFinite(data.rate) || data.rate < 0 || data.rate > 99999999) {
    return { error: 'Enter a valid monthly rate.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.duesSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        monthlyDuesMode: data.mode,
        monthlyDuesRate: Math.round(data.rate * 100) / 100,
      },
      update: { monthlyDuesMode: data.mode, monthlyDuesRate: Math.round(data.rate * 100) / 100 },
    });
    // Saving the community rate is an explicit apply-to-all operation.
    await tx.property.updateMany({ data: { duesRateOverride: false } });
  });

  revalidatePath('/admin/invites');
  revalidatePath('/dues');
  revalidatePath('/home');
  return { success: true };
}

export async function setPrimaryVoterAction(propertyId: string, homeownerId: string) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const homeowner = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
    select: { propertyId: true, passwordHash: true },
  });
  if (!homeowner || homeowner.propertyId !== propertyId) {
    return { error: 'Choose a resident linked to this property.' };
  }
  if (!homeowner.passwordHash) {
    return { error: 'Only an activated resident can be assigned as the primary voter.' };
  }
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { primaryVoterId: true },
  });
  if (!property) return { error: 'Property not found.' };
  if (property.primaryVoterId !== homeownerId) {
    const activeBallotVotes = await prisma.vote.findMany({
      where: {
        propertyId,
        position: {
          election: {
            votingOpensAt: { lte: new Date() },
            OR: [{ closesAt: null }, { closesAt: { gt: new Date() } }],
          },
        },
      },
      select: { homeownerId: true },
    });
    const activeVoterIds = new Set(activeBallotVotes.map((vote) => vote.homeownerId));
    if (
      activeVoterIds.size > 1 ||
      (activeVoterIds.size === 1 && !activeVoterIds.has(homeownerId))
    ) {
      return { error: 'The primary voter cannot be changed after this property starts voting.' };
    }
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: { primaryVoterId: homeownerId },
  });
  revalidatePath('/admin/invites');
  revalidatePath('/vote');
  revalidatePath('/home');
  return { success: true };
}

export async function toggleAdminAction(homeownerId: string) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (admin.id === homeownerId) return { error: 'You cannot change your own admin status.' };

  const target = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
  });
  if (!target) return { error: 'Resident not found.' };

  await prisma.homeowner.update({
    where: { id: homeownerId },
    data: { isAdmin: !target.isAdmin },
  });

  return { success: true };
}

export async function resendInviteAction(homeownerId: string) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const target = await prisma.homeowner.findUnique({ where: { id: homeownerId } });
  if (!target) return { error: 'Resident not found.' };
  if (target.passwordHash) return { error: 'This resident already has an active account.' };

  const inviteToken = crypto.randomBytes(24).toString('hex');
  await prisma.homeowner.update({
    where: { id: homeownerId },
    data: { inviteToken, invitedAt: new Date() },
  });

  return { success: true, token: inviteToken };
}

export async function revokeInviteAction(homeownerId: string) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const target = await prisma.homeowner.findUnique({ where: { id: homeownerId } });
  if (!target) return { error: 'Resident not found.' };
  if (target.passwordHash)
    return { error: 'This resident already has an active account and cannot be revoked this way.' };

  const [duesCount, paymentCount, voteCount] = await Promise.all([
    prisma.duesCharge.count({ where: { homeownerId } }),
    prisma.payment.count({ where: { homeownerId } }),
    prisma.vote.count({ where: { homeownerId } }),
  ]);
  if (duesCount > 0 || paymentCount > 0 || voteCount > 0) {
    return {
      error:
        'This resident already has dues or vote records tied to their account and cannot be revoked this way.',
    };
  }

  await prisma.$transaction(async (tx) => {
    const property = await tx.property.findUniqueOrThrow({
      where: { id: target.propertyId },
      select: { primaryVoterId: true },
    });
    if (property.primaryVoterId === homeownerId) {
      await tx.property.update({
        where: { id: target.propertyId },
        data: { primaryVoterId: null },
      });
    }
    await tx.homeowner.delete({ where: { id: homeownerId } });
  });
  return { success: true };
}
