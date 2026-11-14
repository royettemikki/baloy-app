'use server';

import { randomUUID } from 'node:crypto';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MAX_AVATAR_SIZE = 700 * 1024;
const PHONE_NUMBER_PATTERN = /^\d*$/;

export async function updateProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return { error: 'You must be signed in.' };

  const fullName = String(formData.get('fullName') ?? '').trim();
  const phoneNumber = String(formData.get('phoneNumber') ?? '').trim();
  const emergencyContact = String(formData.get('emergencyContact') ?? '').trim();
  const emergencyContactName = String(formData.get('emergencyContactName') ?? '').trim();

  if (!fullName) return { error: 'Please enter your name.' };
  if (!PHONE_NUMBER_PATTERN.test(phoneNumber)) {
    return { error: 'Phone number can contain numbers only.' };
  }
  if (!PHONE_NUMBER_PATTERN.test(emergencyContact)) {
    return { error: 'Emergency contact number can contain numbers only.' };
  }

  const avatar = formData.get('avatar');
  if (avatar !== null && !(avatar instanceof File)) {
    return { error: 'Choose a valid profile photo.' };
  }
  if (avatar instanceof File && avatar.size > MAX_AVATAR_SIZE) {
    return { error: 'Profile photo is too large after resizing. Choose a smaller image.' };
  }
  if (avatar instanceof File && avatar.type !== 'image/jpeg') {
    return { error: 'Profile photo must be a JPEG image.' };
  }

  let avatarUrl: string | null | undefined;
  if (avatar instanceof File && avatar.size > 0) {
    const blob = await put(
      `profile-photos/${homeownerId}/${randomUUID()}.jpg`,
      avatar,
      { access: 'public', contentType: avatar.type },
    );
    avatarUrl = blob.url;
  } else if (formData.get('removeAvatar') === 'true') {
    avatarUrl = null;
  }

  await prisma.homeowner.update({
    where: { id: homeownerId },
    data: {
      fullName,
      phoneNumber: phoneNumber || null,
      emergencyContact: emergencyContact || null,
      emergencyContactName: emergencyContactName || null,
      notifyEmailAnnouncements: formData.get('notifyEmailAnnouncements') === 'true',
      notifyTextDuesReminders: formData.get('notifyTextDuesReminders') === 'true',
      notifyElectionAlerts: formData.get('notifyElectionAlerts') === 'true',
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    },
  });

  revalidatePath('/profile');
  revalidatePath('/home');
  return { success: true, avatarUrl: avatarUrl ?? null };
}
