import { prisma } from '@/lib/prisma';

export async function getPropertyResidentIds(homeownerId: string): Promise<string[] | null> {
  const homeowner = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
    select: { property: { select: { homeowners: { select: { id: true } } } } },
  });
  return homeowner?.property.homeowners.map((resident) => resident.id) ?? null;
}
