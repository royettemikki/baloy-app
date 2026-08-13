'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import CopyInviteLink from './CopyInviteLink';
import EditResidentPanel from './EditResidentPanel';
import { toggleAdminAction, resendInviteAction, revokeInviteAction } from '@/app/actions/admin';
import { useFlipMenu } from '@/hooks/useFlipMenu';
import { IconDots, IconEdit, IconUser, IconRefresh, IconTrash } from '@/components/Icons';
import { Resident } from '@/types/resident';

export default function ResidentActionsMenu({
  homeowner,
  currentAdminId,
}: {
  homeowner: Resident;
  currentAdminId: string;
}) {
  const { buttonRef, menuOpen, menuStyle, toggleMenu, closeMenu: closeMenuBase } = useFlipMenu();
  const [editing, setEditing] = useState(false);
  const [confirmingRevoke, setConfirmingRevoke] = useState(false);
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const isSelf = homeowner.id === currentAdminId;
  const isPending = !homeowner.passwordHash;

  function closeMenu() {
    closeMenuBase();
    setConfirmingRevoke(false);
    setFreshToken(null);
  }

  function handleToggleAdmin() {
    closeMenu();
    setError(null);
    startTransition(async () => {
      const result = await toggleAdminAction(homeowner.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleResend() {
    setError(null);
    startTransition(async () => {
      const result = await resendInviteAction(homeowner.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setFreshToken(result.token!);
      router.refresh();
    });
  }

  function handleRevoke() {
    setError(null);
    startTransition(async () => {
      const result = await revokeInviteAction(homeowner.id);
      if (result.error) {
        setError(result.error);
        setConfirmingRevoke(false);
        return;
      }
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
              className="z-50 w-56 rounded-xl border border-line bg-surface py-1.5 text-left shadow-lg"
            >
              {freshToken ? (
                <div className="px-3.5 py-2.5">
                  <p className="mb-1.5 text-xs font-medium text-brand-strong">
                    New link ready — old one no longer works.
                  </p>
                  <CopyInviteLink token={freshToken} />
                </div>
              ) : confirmingRevoke ? (
                <div className="px-3.5 py-2.5">
                  <p className="mb-2 text-xs text-ink-soft">Delete this pending invite?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmingRevoke(false)}
                      className="flex-1 rounded-lg border border-line py-1.5 text-xs font-medium text-ink-soft"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRevoke}
                      disabled={pending}
                      className="flex-1 rounded-lg bg-danger py-1.5 text-xs font-medium text-white disabled:opacity-60"
                    >
                      {pending ? 'Revoking…' : 'Yes, revoke'}
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
                    <IconEdit width={14} height={14} className="text-ink-soft" /> Edit details
                  </button>

                  {!isSelf && (
                    <button
                      onClick={handleToggleAdmin}
                      disabled={pending}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-sm hover:bg-surface-muted disabled:opacity-60"
                    >
                      <IconUser width={14} height={14} className="text-ink-soft" />
                      {homeowner.isAdmin ? 'Remove admin access' : 'Make admin'}
                    </button>
                  )}

                  {isPending && (
                    <>
                      <button
                        onClick={handleResend}
                        disabled={pending}
                        className="flex w-full items-center gap-2 px-3.5 py-2 text-sm hover:bg-surface-muted disabled:opacity-60"
                      >
                        <IconRefresh width={14} height={14} className="text-ink-soft" /> Resend
                        invite
                      </button>
                      <button
                        onClick={() => setConfirmingRevoke(true)}
                        className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-danger hover:bg-surface-muted"
                      >
                        <IconTrash width={14} height={14} /> Revoke invite
                      </button>
                    </>
                  )}

                  {isPending && homeowner.inviteToken && (
                    <div className="mt-1 border-t border-line px-3.5 py-2">
                      <CopyInviteLink token={homeowner.inviteToken} />
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {editing && <EditResidentPanel homeowner={homeowner} onClose={() => setEditing(false)} />}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </>
  );
}
