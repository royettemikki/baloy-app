'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import CopyInviteLink from './CopyInviteLink';
import EditResidentPanel from './EditResidentPanel';
import {
  toggleAdminAction,
  resendInviteAction,
  revokeInviteAction,
  setPrimaryVoterAction,
  linkHomeownerToPropertyAction,
  removeHomeownerFromPropertyAction,
} from '@/app/actions/admin';
import { useFlipMenu } from '@/hooks/useFlipMenu';
import { IconDots, IconEdit, IconUser, IconRefresh, IconTrash } from '@/components/Icons';
import { Resident } from '@/types/resident';

type Toast = { message: string; tone: 'success' | 'error' };

export default function ResidentActionsMenu({
  homeowner,
  currentAdminId,
  propertyOptions,
}: {
  homeowner: Resident;
  currentAdminId: string;
  propertyOptions: { id: string; unit: string }[];
}) {
  const { buttonRef, menuOpen, menuStyle, toggleMenu, closeMenu: closeMenuBase } = useFlipMenu();
  const [editing, setEditing] = useState(false);
  const [confirmingRevoke, setConfirmingRevoke] = useState(false);
  const [confirmingUnlink, setConfirmingUnlink] = useState(false);
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(homeowner.propertyId);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const isSelf = homeowner.id === currentAdminId;
  const isPending = !homeowner.passwordHash;

  function closeMenu() {
    closeMenuBase();
    setConfirmingRevoke(false);
    setConfirmingUnlink(false);
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

  function handleSetPrimaryVoter() {
    closeMenu();
    setError(null);
    startTransition(async () => {
      const result = await setPrimaryVoterAction(selectedPropertyId, homeowner.id);
      if (result.error) {
        setToast({ message: result.error, tone: 'error' });
        return;
      }
      setToast({ message: 'Primary owner updated.', tone: 'success' });
      router.refresh();
    });
  }

  function handleLinkProperty() {
    closeMenu();
    setError(null);
    startTransition(async () => {
      const result = await linkHomeownerToPropertyAction(selectedPropertyId, homeowner.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleRemovePropertyLink() {
    setError(null);
    startTransition(async () => {
      const result = await removeHomeownerFromPropertyAction(selectedPropertyId, homeowner.id);
      if (result.error) {
        setError(result.error);
        setConfirmingUnlink(false);
        return;
      }
      closeMenu();
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
              ) : confirmingRevoke || confirmingUnlink ? (
                <div className="px-3.5 py-2.5">
                  <p className="mb-2 text-xs text-ink-soft">
                    {confirmingRevoke
                      ? 'Delete this pending invite?'
                      : `Remove ${homeowner.fullName} from ${propertyOptions.find((property) => property.id === selectedPropertyId)?.unit ?? 'this property'}?`}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConfirmingRevoke(false);
                        setConfirmingUnlink(false);
                      }}
                      className="flex-1 rounded-lg border border-line py-1.5 text-xs font-medium text-ink-soft"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmingRevoke ? handleRevoke : handleRemovePropertyLink}
                      disabled={pending}
                      className="flex-1 rounded-lg bg-danger py-1.5 text-xs font-medium text-surface disabled:opacity-60"
                    >
                      {pending
                        ? confirmingRevoke
                          ? 'Revoking…'
                          : 'Removing…'
                        : confirmingRevoke
                          ? 'Yes, revoke'
                          : 'Remove link'}
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

                  <div className="border-line/60 border-t px-3.5 py-2.5">
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                      Property membership
                    </label>
                    <select
                      value={selectedPropertyId}
                      onChange={(event) => setSelectedPropertyId(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-xs"
                    >
                      {propertyOptions.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.unit}
                        </option>
                      ))}
                    </select>
                    {!homeowner.propertyMembershipIds.includes(selectedPropertyId) ? (
                      <button
                        onClick={handleLinkProperty}
                        disabled={pending}
                        className="mt-2 w-full rounded-lg bg-surface-muted px-2 py-1.5 text-xs font-medium text-ink-soft disabled:opacity-60"
                      >
                        Link account to property
                      </button>
                    ) : homeowner.primaryPropertyIds.includes(selectedPropertyId) ? (
                      <>
                        <p className="mt-2 text-xs font-medium text-brand-strong">
                          Primary owner for this property
                        </p>
                        {selectedPropertyId !== homeowner.propertyId && (
                          <button
                            onClick={() => setConfirmingUnlink(true)}
                            className="mt-1.5 w-full rounded-lg px-2 py-1.5 text-xs font-medium text-danger hover:bg-danger-soft"
                          >
                            Remove property link
                          </button>
                        )}
                      </>
                    ) : !isPending ? (
                      <>
                        <button
                          onClick={handleSetPrimaryVoter}
                          disabled={pending}
                          className="mt-2 w-full rounded-lg bg-purple-soft px-2 py-1.5 text-xs font-medium text-purple disabled:opacity-60"
                        >
                          Set as primary owner
                        </button>
                        {selectedPropertyId !== homeowner.propertyId && (
                          <button
                            onClick={() => setConfirmingUnlink(true)}
                            className="mt-1.5 w-full rounded-lg px-2 py-1.5 text-xs font-medium text-danger hover:bg-danger-soft"
                          >
                            Remove property link
                          </button>
                        )}
                      </>
                    ) : null}
                  </div>

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
      {toast && (
        <div
          role={toast.tone === 'error' ? 'alert' : 'status'}
          aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
          className={`fixed bottom-5 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.tone === 'error'
              ? 'bg-danger text-white'
              : 'bg-brand text-on-brand'
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
