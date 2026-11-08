import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getAdminOrNull() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return null;
  const homeowner = await prisma.homeowner.findUnique({ where: { id: homeownerId } });
  return homeowner?.isAdmin ? homeowner : null;
}
