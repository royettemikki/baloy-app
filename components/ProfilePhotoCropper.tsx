'use client';

import { PointerEvent, useEffect, useRef, useState } from 'react';
import { IconX } from '@/components/Icons';

const CROP_SIZE = 280;
const OUTPUT_SIZE = 512;
const MAX_OUTPUT_SIZE = 700 * 1024;

export default function ProfilePhotoCropper({
  imageUrl,
  onCancel,
  onApply,
}: {
  imageUrl: string;
  onCancel: () => void;
  onApply: (file: File, previewUrl: string) => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const cropViewportRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{
    pointerX: number;
    pointerY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [cropSize, setCropSize] = useState(CROP_SIZE);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const viewport = cropViewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => {
      setCropSize(entry.contentRect.width);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const coverScale = imageSize
    ? Math.max(cropSize / imageSize.width, cropSize / imageSize.height)
    : 1;
  const renderedWidth = imageSize ? imageSize.width * coverScale * zoom : CROP_SIZE;
  const renderedHeight = imageSize ? imageSize.height * coverScale * zoom : CROP_SIZE;
  const maxOffsetX = Math.max(0, (renderedWidth - cropSize) / 2);
  const maxOffsetY = Math.max(0, (renderedHeight - cropSize) / 2);
  const imageLeft = (cropSize - renderedWidth) / 2 + offset.x;
  const imageTop = (cropSize - renderedHeight) / 2 + offset.y;

  function handleZoom(value: number) {
    const nextZoom = Math.min(3, Math.max(1, value));
    const nextWidth = imageSize ? imageSize.width * coverScale * nextZoom : cropSize;
    const nextHeight = imageSize ? imageSize.height * coverScale * nextZoom : cropSize;
    setZoom(nextZoom);
    setOffset({
      x: Math.max(-(nextWidth - cropSize) / 2, Math.min((nextWidth - cropSize) / 2, offset.x)),
      y: Math.max(-(nextHeight - cropSize) / 2, Math.min((nextHeight - cropSize) / 2, offset.y)),
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!imageSize || processing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return;
    setOffset({
      x: Math.max(
        -maxOffsetX,
        Math.min(
          maxOffsetX,
          dragStart.current.offsetX + event.clientX - dragStart.current.pointerX,
        ),
      ),
      y: Math.max(
        -maxOffsetY,
        Math.min(
          maxOffsetY,
          dragStart.current.offsetY + event.clientY - dragStart.current.pointerY,
        ),
      ),
    });
  }

  async function handleApply() {
    const image = imageRef.current;
    if (!image || !imageSize) return;
    setProcessing(true);
    setError(null);
    try {
      const sourceX = Math.max(
        0,
        Math.min(
          imageSize.width - cropSize / (coverScale * zoom),
          (-imageLeft / renderedWidth) * imageSize.width,
        ),
      );
      const sourceY = Math.max(
        0,
        Math.min(
          imageSize.height - cropSize / (coverScale * zoom),
          (-imageTop / renderedHeight) * imageSize.height,
        ),
      );
      const sourceWidth = (cropSize / renderedWidth) * imageSize.width;
      const sourceHeight = (cropSize / renderedHeight) * imageSize.height;
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not prepare your profile photo.');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
      );

      let blob: Blob | null = null;
      for (const quality of [0.88, 0.76, 0.64, 0.52]) {
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', quality),
        );
        if (blob && blob.size <= MAX_OUTPUT_SIZE) break;
      }
      if (!blob) throw new Error('Could not prepare your profile photo.');
      if (blob.size > MAX_OUTPUT_SIZE) {
        throw new Error('This photo is too detailed to upload. Try a different image.');
      }

      const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
      onApply(file, URL.createObjectURL(file));
    } catch (cropError) {
      setError(
        cropError instanceof Error
          ? cropError.message
          : 'Could not crop your photo. Please try again.',
      );
      setProcessing(false);
    }
  }

  return (
    <div className="bg-overlay/70 fixed inset-0 z-[70] flex items-end justify-center p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-photo-crop-title"
        className="w-full max-w-md animate-fadeInUp rounded-t-[28px] bg-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:rounded-[28px] sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-strong">
              Profile photo
            </p>
            <h2 id="profile-photo-crop-title" className="mt-1 text-lg font-semibold text-ink">
              Make it yours
            </h2>
            <p className="mt-1 text-xs text-ink-muted">Drag to reposition, then zoom to crop.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            aria-label="Cancel photo crop"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-soft transition hover:bg-surface-hover disabled:opacity-50"
          >
            <IconX width={16} height={16} />
          </button>
        </div>

        <div className="mx-auto mb-4 w-fit rounded-[26px] bg-gradient-to-br from-brand via-accentwarm to-brand p-[3px] shadow-[0_12px_30px_-16px_var(--brand)]">
          <div
            ref={cropViewportRef}
            className="relative touch-none overflow-hidden rounded-[23px] border-[3px] border-surface bg-surface-muted"
            style={{ width: 'min(280px, calc(100vw - 3.5rem))', aspectRatio: '1' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => {
              dragStart.current = null;
            }}
            onPointerCancel={() => {
              dragStart.current = null;
            }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Photo crop preview"
              draggable={false}
              onLoad={(event) => {
                setImageSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                });
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="pointer-events-none absolute max-w-none select-none"
              style={{
                width: renderedWidth,
                height: renderedHeight,
                left: imageLeft,
                top: imageTop,
              }}
            />
            <div className="pointer-events-none absolute inset-[6%] rounded-full border border-white/80 shadow-[0_0_0_999px_rgba(10,20,15,0.2)]" />
          </div>
        </div>

        <label
          htmlFor="profile-photo-zoom"
          className="mb-2 flex items-center justify-between text-xs text-ink-soft"
        >
          <span>Zoom</span>
          <span className="tabular-nums text-ink-muted">{zoom.toFixed(1)}×</span>
        </label>
        <input
          id="profile-photo-zoom"
          type="range"
          min="1"
          max="3"
          step="0.05"
          value={zoom}
          onChange={(event) => handleZoom(Number(event.target.value))}
          className="mb-4 w-full accent-brand"
          disabled={!imageSize || processing}
        />
        {error && (
          <p role="alert" className="mb-3 text-xs text-danger">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="min-h-11 flex-1 rounded-xl border border-line bg-surface text-sm font-semibold text-ink-soft transition hover:bg-surface-hover disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!imageSize || processing}
            aria-busy={processing}
            className="min-h-11 flex-1 rounded-xl bg-brand text-sm font-semibold text-on-brand shadow-sm transition hover:bg-brand-strong disabled:opacity-60"
          >
            {processing ? 'Preparing…' : 'Use this photo'}
          </button>
        </div>
      </section>
    </div>
  );
}
