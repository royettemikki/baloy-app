'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import EditAnnouncementPanel from './EditAnnouncementPanel';
import { deleteAnnouncementAction } from '@/app/actions/announcements';
import { useFlipMenu } from '@/hooks/useFlipMenu';
import { IconDots, IconEdit, IconTrash } from '@/components/Icons';
import { Announcement } from '@/types/announcement';

export default function AnnouncementActionsMenu({ announcement }: { announcement: Announcement }) {
  const { buttonRef, menuOpen, menuStyle, toggleMenu, closeMenu: closeMenuBase } = useFlipMenu();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function closeMenu() {
    closeMenuBase();
    setConfirmingDelete(false);
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteAnnouncementAction(announcement.id);
      closeMenu();
      router.refresh();
    });
  }

  return (
    <>
      <div className="relative inline-block">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-surface-muted"
        >
          <IconDots width={16} height={16} className="text-ink-soft" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <div
              style={menuStyle}
              className="z-50 w-52 rounded-xl border border-line bg-surface py-1.5 text-left shadow-lg"
            >
              {confirmingDelete ? (
                <div className="px-3.5 py-2.5">
                  <p className="mb-2 text-xs text-ink-soft">Delete this announcement?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmingDelete(false)}
                      className="flex-1 rounded-lg border border-line py-1.5 text-xs font-medium text-ink-soft"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={pending}
                      className="flex-1 rounded-lg bg-danger py-1.5 text-xs font-medium text-white disabled:opacity-60"
                    >
                      {pending ? 'Deleting…' : 'Yes, delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditing(true);
                      closeMenu();
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-sm hover:bg-surface-muted"
                  >
                    <IconEdit width={14} height={14} className="text-ink-soft" /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-danger hover:bg-surface-muted"
                  >
                    <IconTrash width={14} height={14} /> Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {editing && (
        <EditAnnouncementPanel announcement={announcement} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
