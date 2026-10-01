'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updatePositionAction, deletePositionAction } from '@/app/actions/elections';

export default function PositionRow({
  positionId,
  title,
  seats,
  children,
}: {
  positionId: number;
  title: string;
  seats: number;
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
    <div className="mb-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
      {editing ? (
        <div className="mb-3 flex flex-col gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={1}
            value={newSeats}
            onChange={(e) => setNewSeats(e.target.value)}
            className="w-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={pending}
              className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-on-brand disabled:opacity-60"
            >
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-2 py-1.5 text-xs font-medium text-ink-soft"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">
            {title}{' '}
            <span className="text-xs text-ink-muted">
              ({seats} seat{seats === 1 ? '' : 's'})
            </span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft"
            >
              Edit
            </button>
            {confirmingDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="px-1.5 text-xs text-ink-soft"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={pending}
                  className="rounded-lg bg-danger px-2.5 py-1.5 text-xs font-medium text-surface disabled:opacity-60"
                >
                  {pending ? 'Deleting…' : 'Confirm'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-danger"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
      {error && !editing && <p className="mb-2 text-xs text-danger">{error}</p>}
      {children}
    </div>
  );
}
