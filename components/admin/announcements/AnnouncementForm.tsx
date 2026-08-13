'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAnnouncementAction, updateAnnouncementAction } from '@/app/actions/announcements';
import { ANNOUNCEMENT_TAGS, AnnouncementTag } from '@/constants/announcementTags';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUploadField from './ImageUploadField';

type Initial = {
  id?: number;
  title: string;
  body: string;
  tag: AnnouncementTag;
  pinned: boolean;
  postedBy: string;
  imageUrl?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
};

function toDateInputValue(iso?: string | null) {
  return iso ? iso.slice(0, 10) : '';
}

export default function AnnouncementForm({
  initial,
  onDone,
}: {
  initial?: Initial;
  onDone: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [tag, setTag] = useState<AnnouncementTag>(initial?.tag ?? 'Board');
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [postedBy, setPostedBy] = useState(initial?.postedBy ?? '');
  const [image, setImage] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [hasDateRange, setHasDateRange] = useState(!!(initial?.startsAt || initial?.expiresAt));
  const [startsAt, setStartsAt] = useState(toDateInputValue(initial?.startsAt));
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(initial?.expiresAt));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set('title', title);
    formData.set('body', body);
    formData.set('tag', tag);
    formData.set('pinned', String(pinned));
    formData.set('postedBy', postedBy);
    if (image) formData.set('image', image);
    formData.set('removeImage', String(imageRemoved));
    formData.set('startsAt', hasDateRange ? startsAt : '');
    formData.set('expiresAt', hasDateRange ? expiresAt : '');

    const result = initial?.id
      ? await updateAnnouncementAction(initial.id, formData)
      : await createAnnouncementAction(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

      <div>
        <label className="mb-1.5 block text-[11px] text-ink-soft">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={5}
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
        />
      </div>

      <ImageUploadField
        existingUrl={initial?.imageUrl ?? null}
        onFileChange={setImage}
        onRemove={() => setImageRemoved(true)}
      />

      <div>
        <label className="mb-1.5 block text-[11px] text-ink-soft">Category</label>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value as AnnouncementTag)}
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
        >
          {Object.keys(ANNOUNCEMENT_TAGS).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Posted by"
        value={postedBy}
        onChange={(e) => setPostedBy(e.target.value)}
        placeholder="e.g. Facilities Committee"
        required
      />

      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="h-4 w-4"
        />
        Pin to the top of Notices
      </label>

      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={hasDateRange}
          onChange={(e) => setHasDateRange(e.target.checked)}
          className="h-4 w-4"
        />
        Set a visible date range (otherwise this shows with no expiration)
      </label>

      {hasDateRange && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Visible from"
            type="date"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
          <Input
            label="Expires on"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? 'Saving…' : initial?.id ? 'Save changes' : 'Post announcement'}
      </Button>
    </form>
  );
}
