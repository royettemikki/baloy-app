'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updatePositionAction, deletePositionAction } from '@/app/actions/elections';

export default function PositionRow({
  positionId,
  title,
  seats,
  locked = false,
  lockLabel = 'Ballot locked',
  children,
}: {
  positionId: number;
  title: string;
  seats: number;
  locked?: boolean;
  lockLabel?: string;
  children: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newSeats, setNewSeats] = useState(String(seats));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updatePositionAction(positionId, newTitle, parseInt(newSeats, 10));
      if (result.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  function handleCancelEdit() {
    setEditing(false);
    setNewTitle(title);
    setNewSeats(String(seats));
    setError(null);
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deletePositionAction(positionId);
      if (result.error) {
        setError(result.error);
        setConfirmingDelete(false);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="mb-3 overflow-hidden rounded-2xl bg-surface p-3.5 shadow-md sm:p-4 md:min-h-[360px] xl:min-h-[400px]">
      {editing && !locked ? (
        <div className="mb-3 flex flex-col gap-2">
          <input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            className="rounded-lg bg-surface px-3 py-2 text-sm"
            aria-label="Position title"
          />
          <input
            type="number"
            min={1}
            value={newSeats}
            onChange={(event) => setNewSeats(event.target.value)}
            className="w-24 rounded-lg bg-surface px-3 py-2 text-sm"
            aria-label="Number of seats"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={pending} className="rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-on-brand disabled:opacity-60">
              {pending ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleCancelEdit} className="px-2 py-1.5 text-xs font-medium text-ink-soft">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-brand-soft/40 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-on-brand">{title.slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Position</p>
              <p className="truncate text-sm font-semibold text-ink">{title}</p>
            </div>
            <span className="shrink-0 rounded-full bg-surface/70 px-2.5 py-1 text-[10px] font-medium text-ink-soft">
              {seats} seat{seats === 1 ? '' : 's'}
            </span>
          </div>
          {locked ? (
            <span className="shrink-0 rounded-full bg-surface/70 px-2.5 py-1 text-[10px] font-medium text-ink-muted">{lockLabel}</span>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5">
              <button onClick={() => setEditing(true)} className="rounded-lg bg-surface/70 px-2.5 py-1.5 text-xs font-medium text-ink-soft">Edit</button>
              {confirmingDelete ? (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setConfirmingDelete(false)} className="px-1.5 text-xs text-ink-soft">Cancel</button>
                  <button onClick={handleDelete} disabled={pending} className="rounded-lg bg-danger px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-60">
                    {pending ? 'Deleting...' : 'Confirm'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmingDelete(true)} className="rounded-lg bg-danger-soft px-2.5 py-1.5 text-xs font-medium text-danger">Delete</button>
              )}
            </div>
          )}
        </div>
      )}
      {error && !editing && <p className="mb-2 text-xs text-danger">{error}</p>}
      {children}
    </section>
  );
}
