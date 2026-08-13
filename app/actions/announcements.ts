'use server';

import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';
import { AnnouncementTag } from '@/constants/announcementTags';

function revalidateResidentPages() {
  revalidatePath('/notices');
  revalidatePath('/home');
}

const MAX_UPLOAD_SIZE = 8 * 1024 * 1024; // 8MB — a resized image should always be well under this

async function uploadImageIfPresent(
  formData: FormData,
): Promise<{ url: string | null; error?: string }> {
  const file = formData.get('image');
  if (!(file instanceof File) || file.size === 0) return { url: null };
  if (file.size > MAX_UPLOAD_SIZE) return { url: null, error: 'Image is too large.' };

  const blob = await put(`announcements/${Date.now()}-${file.name}`, file, { access: 'public' });
  return { url: blob.url };
}

function parseDateField(value: FormDataEntryValue | null): Date | null {
  if (!value || typeof value !== 'string' || value.trim() === '') return null;
  return new Date(value);
}

export async function createAnnouncementAction(formData: FormData) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const { url: imageUrl, error: imageError } = await uploadImageIfPresent(formData);
  if (imageError) return { error: imageError };

  await prisma.announcement.create({
    data: {
      title: String(formData.get('title')),
      body: String(formData.get('body')),
      tag: formData.get('tag') as AnnouncementTag,
      pinned: formData.get('pinned') === 'true',
      postedBy: String(formData.get('postedBy')),
      imageUrl,
      startsAt: parseDateField(formData.get('startsAt')),
      expiresAt: parseDateField(formData.get('expiresAt')),
    },
  });

  revalidateResidentPages();
  return { success: true };
}

export async function updateAnnouncementAction(id: number, formData: FormData) {
  const admin = await getAdminOrNull();
  if (!admin) {
    return { error: 'You do not have permission to do this.' };
  }

  const { url: newImageUrl, error: imageError } = await uploadImageIfPresent(formData);
  if (imageError) {
    return { error: imageError };
  }
  const removeImage = formData.get('removeImage') === 'true';

  let imageUpdate: { imageUrl: string | null } | {} = {};
  if (newImageUrl) {
    imageUpdate = { imageUrl: newImageUrl };
  } else if (removeImage) {
    imageUpdate = { imageUrl: null };
  }

  await prisma.announcement.update({
    where: { id },
    data: {
      title: String(formData.get('title')),
      body: String(formData.get('body')),
      tag: formData.get('tag') as AnnouncementTag,
      pinned: formData.get('pinned') === 'true',
      postedBy: String(formData.get('postedBy')),
      ...imageUpdate,
      startsAt: parseDateField(formData.get('startsAt')),
      expiresAt: parseDateField(formData.get('expiresAt')),
    },
  });

  revalidateResidentPages();
  return { success: true };
}

export async function deleteAnnouncementAction(id: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  await prisma.announcement.delete({ where: { id } });
  revalidateResidentPages();
  return { success: true };
}

export async function togglePinAction(id: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) return { error: 'Announcement not found.' };

  await prisma.announcement.update({ where: { id }, data: { pinned: !announcement.pinned } });
  revalidateResidentPages();
  return { success: true };
}
