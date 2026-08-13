'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function claimInviteAction(token: string, password: string) {
  const homeowner = await prisma.homeowner.findUnique({
    where: { inviteToken: token },
  });

  if (!homeowner) {
    return { error: 'This invite link is invalid.' };
  }
  if (homeowner.passwordHash) {
    return {
      error: 'This account has already been set up. Try signing in instead.',
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.homeowner.update({
    where: { id: homeowner.id },
    data: { passwordHash, joinedAt: new Date(), inviteToken: null },
  });

  return { success: true, email: homeowner.email };
}
