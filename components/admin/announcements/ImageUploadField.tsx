'use client';

import { useRef, useState } from 'react';
import { IconImage, IconX } from '@/components/Icons';
import { resizeImageFile } from '@/lib/resizeImage';

const MAX_ORIGINAL_SIZE = 15 * 1024 * 1024; // 15MB — guards against trying to process something absurdly large

export default function ImageUploadField({
  existingUrl,
  onFileChange,
  onRemove,
}: {
  existingUrl: string | null;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl);
  const [removed, setRemoved] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(file: File | null) {
    setError(null);
    if (!file) return;

    if (file.size > MAX_ORIGINAL_SIZE) {
      setError('That image is too large (max 15MB). Please choose a smaller file.');
      return;
    }

    setProcessing(true);
    try {
      const resized = await resizeImageFile(file);
      onFileChange(resized);
      setPreviewUrl(URL.createObjectURL(resized));
      setRemoved(false);
    } catch {
      setError('Could not process that image. Try a different file.');
    } finally {
      setProcessing(false);
    }
  }

  function handleRemove() {
    onRemove();
    onFileChange(null);
    setPreviewUrl(null);
    setRemoved(true);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <label className="mb-1.5 block text-[11px] text-ink-soft">Image (optional)</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
      />

      {error && <p className="mb-2 text-xs text-danger">{error}</p>}

      {processing ? (
        <div className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-line py-8 text-ink-muted">
          <span className="text-xs font-medium">Processing image…</span>
        </div>
      ) : previewUrl && !removed ? (
        <div className="relative overflow-hidden rounded-xl border border-line">
          <img src={previewUrl} alt="" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60"
          >
            <IconX width={13} height={13} className="text-white" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line py-8 text-ink-muted transition-colors hover:border-brand hover:text-brand"
        >
          <IconImage width={22} height={22} />
          <span className="text-xs font-medium">Click to upload an image</span>
        </button>
      )}

      <p className="mt-1.5 text-[11px] text-ink-muted">
        Images are automatically resized for phone screens.
      </p>
    </div>
  );
}
