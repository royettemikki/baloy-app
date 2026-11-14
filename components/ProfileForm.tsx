'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { updateProfileAction } from '@/app/actions/profile';
import { IconImage } from '@/components/Icons';
import ProfilePhotoCropper from '@/components/ProfilePhotoCropper';
import ThemeToggle from '@/components/ui/ThemeToggle';

const MAX_ORIGINAL_AVATAR_SIZE = 15 * 1024 * 1024;

type Profile = {
  fullName: string;
  unit: string;
  email: string;
  phoneNumber: string;
  emergencyContactName: string;
  emergencyContact: string;
  avatarUrl: string | null;
  ownerSince: number;
  notifyEmailAnnouncements: boolean;
  notifyTextDuesReminders: boolean;
  notifyElectionAlerts: boolean;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [emergencyContactName, setEmergencyContactName] = useState(
    profile.emergencyContactName,
  );
  const [emergencyContact, setEmergencyContact] = useState(
    profile.emergencyContact,
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const [notifyEmailAnnouncements, setNotifyEmailAnnouncements] = useState(
    profile.notifyEmailAnnouncements,
  );
  const [notifyTextDuesReminders, setNotifyTextDuesReminders] = useState(
    profile.notifyTextDuesReminders,
  );
  const [notifyElectionAlerts, setNotifyElectionAlerts] = useState(
    profile.notifyElectionAlerts,
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  useEffect(
    () => () => {
      if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
      if (cropSourceUrl?.startsWith('blob:')) URL.revokeObjectURL(cropSourceUrl);
    },
    [avatarPreview, cropSourceUrl],
  );

  async function handleAvatarSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    setAvatarError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Choose an image file for your profile photo.');
      return;
    }
    if (file.size > MAX_ORIGINAL_AVATAR_SIZE) {
      setAvatarError('Choose an image smaller than 15 MB.');
      return;
    }

    if (cropSourceUrl?.startsWith('blob:')) URL.revokeObjectURL(cropSourceUrl);
    setCropSourceUrl(URL.createObjectURL(file));
  }

  function handleCropApply(file: File, previewUrl: string) {
    if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    if (cropSourceUrl?.startsWith('blob:')) URL.revokeObjectURL(cropSourceUrl);
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setRemoveAvatar(false);
    setSaved(false);
    setCropSourceUrl(null);
  }

  function handleCropCancel() {
    if (cropSourceUrl?.startsWith('blob:')) URL.revokeObjectURL(cropSourceUrl);
    setCropSourceUrl(null);
  }

  function handleRemoveAvatar() {
    if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(Boolean(savedAvatarUrl));
    setSaved(false);
    setAvatarError(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const formData = new FormData();
      formData.set('fullName', fullName);
      formData.set('phoneNumber', phoneNumber);
      formData.set('emergencyContactName', emergencyContactName);
      formData.set('emergencyContact', emergencyContact);
      formData.set('notifyEmailAnnouncements', String(notifyEmailAnnouncements));
      formData.set('notifyTextDuesReminders', String(notifyTextDuesReminders));
      formData.set('notifyElectionAlerts', String(notifyElectionAlerts));
      formData.set('removeAvatar', String(removeAvatar));
      if (avatarFile) formData.set('avatar', avatarFile);

      const result = await updateProfileAction(formData);
      if (result.error) {
        setSaveError(result.error);
        return;
      }
      if (avatarFile) {
        const savedUrl = result.avatarUrl ?? null;
        setSavedAvatarUrl(savedUrl);
        setAvatarPreview(savedUrl);
        setAvatarFile(null);
      } else if (removeAvatar) {
        setSavedAvatarUrl(null);
      }
      setRemoveAvatar(false);
      setSaved(true);
    } catch {
      setSaveError('We couldn’t save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function Toggle({
    label,
    on,
    onToggle,
  }: {
    label: string;
    on: boolean;
    onToggle: () => void;
  }) {
    return (
      <button
        type="button"
        aria-label={`Turn ${on ? 'off' : 'on'} ${label}`}
        aria-pressed={on}
        onClick={() => {
          onToggle();
          setSaved(false);
        }}
        className={`w-9 h-[22px] rounded-pill relative transition-colors ${on ? 'bg-brand' : 'bg-line'}`}
      >
        <span
          className={`absolute top-0.5 w-[17px] h-[17px] rounded-full bg-on-brand-surface transition-all ${on ? 'right-0.5' : 'left-0.5'}`}
        />
      </button>
    );
  }

  return (
    <div className='animate-fadeInUp'>
      <div className='mb-6 flex flex-col items-center text-center'>
        <div className='relative mb-3'>
          <div className='rounded-full bg-gradient-to-br from-brand via-accentwarm to-brand p-[3px] shadow-[0_8px_24px_-12px_var(--brand)]'>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={`${fullName}'s profile`}
                className='h-24 w-24 rounded-full border-[3px] border-surface object-cover sm:h-28 sm:w-28'
              />
            ) : (
              <div className='flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-surface bg-brand-soft text-2xl font-semibold text-brand-strong sm:h-28 sm:w-28'>
                {initials}
              </div>
            )}
          </div>
          <input
            ref={avatarInputRef}
            type='file'
            accept='image/*'
            onChange={handleAvatarSelect}
            className='sr-only'
            aria-label='Choose a profile photo'
          />
          <button
            type='button'
            onClick={() => avatarInputRef.current?.click()}
            disabled={saving}
            className='absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-surface bg-brand text-on-brand shadow-md transition hover:scale-105 disabled:opacity-60'
            aria-label={avatarPreview ? 'Change profile photo' : 'Upload profile photo'}
          >
            <IconImage width={16} height={16} />
          </button>
        </div>
        <button
          type='button'
          onClick={() => avatarInputRef.current?.click()}
          disabled={saving}
          className='text-xs font-semibold text-brand-strong transition hover:text-brand'
        >
          {avatarPreview ? 'Change profile photo' : 'Add a profile photo'}
        </button>
        {avatarPreview && (
          <button
            type='button'
            onClick={handleRemoveAvatar}
            disabled={saving}
            className='mt-1 text-[11px] text-ink-muted underline decoration-line underline-offset-2 transition hover:text-danger'
          >
            Remove photo
          </button>
        )}
        {avatarError && (
          <p role='alert' className='mt-2 text-xs text-danger'>
            {avatarError}
          </p>
        )}
        <p className='mt-2 text-base font-medium'>{fullName}</p>
        <p className='text-xs text-ink-soft'>
          Unit {profile.unit} · Owner since {profile.ownerSince}
        </p>
      </div>

      <div className='ui-card flex items-center justify-between gap-4 p-3.5 mb-4'>
        <div>
          <p className='text-sm font-semibold text-ink'>Appearance</p>
          <p className='mt-0.5 text-xs text-ink-muted'>Choose light or dark mode.</p>
        </div>
        <ThemeToggle compact />
      </div>

      <div className='grid gap-4 md:grid-cols-2 md:items-start'>
        <section className='min-w-0'>
          <p className='mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-muted'>Contact</p>
          <div className='mb-4 overflow-hidden rounded-2xl bg-surface-muted px-3.5'>
            <div className='flex items-center gap-3 border-b border-line py-3'>
              <span className='shrink-0 text-[13.5px] text-ink-soft'>Full name</span>
              <input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setSaved(false);
                }}
                className='min-w-0 flex-1 bg-transparent text-right text-[13.5px] outline-none'
              />
            </div>
            <div className='flex items-center gap-3 border-b border-line py-3'>
              <span className='shrink-0 text-[13.5px] text-ink-soft'>Email</span>
              <span className='min-w-0 flex-1 truncate text-right text-[13.5px] text-ink-muted'>{profile.email}</span>
            </div>
            <div className='flex items-center gap-3 border-b border-line py-3'>
              <label htmlFor='profile-phone' className='shrink-0 text-[13.5px] text-ink-soft'>Phone</label>
              <input
                id='profile-phone'
                type='text'
                inputMode='numeric'
                pattern='[0-9]*'
                autoComplete='tel'
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value.replace(/\D/g, ''));
                  setSaved(false);
                }}
                placeholder='Numbers only'
                aria-describedby='profile-phone-hint'
                className='min-w-0 flex-1 bg-transparent text-right text-[13.5px] outline-none'
              />
            </div>
            <p id='profile-phone-hint' className='-mt-1 border-b border-line pb-2 text-right text-[10px] text-ink-muted'>
              Digits only
            </p>
            <div className='flex items-center gap-3 border-b border-line py-3'>
              <label htmlFor='emergency-contact-name' className='shrink-0 text-[13.5px] text-ink-soft'>Emergency name</label>
              <input
                id='emergency-contact-name'
                value={emergencyContactName}
                onChange={(e) => {
                  setEmergencyContactName(e.target.value);
                  setSaved(false);
                }}
                placeholder='Contact name'
                className='min-w-0 flex-1 bg-transparent text-right text-[13.5px] outline-none'
              />
            </div>
            <div className='flex items-center gap-3 py-3'>
              <label htmlFor='emergency-contact-phone' className='shrink-0 text-[13.5px] text-ink-soft'>Emergency phone</label>
              <input
                id='emergency-contact-phone'
                type='text'
                inputMode='numeric'
                pattern='[0-9]*'
                autoComplete='tel'
                value={emergencyContact}
                onChange={(e) => {
                  setEmergencyContact(e.target.value.replace(/\D/g, ''));
                  setSaved(false);
                }}
                placeholder='Numbers only'
                aria-describedby='emergency-contact-hint'
                className='min-w-0 flex-1 bg-transparent text-right text-[13.5px] outline-none'
              />
            </div>
            <p id='emergency-contact-hint' className='-mt-1 pb-3 text-right text-[10px] text-ink-muted'>
              Digits only
            </p>
          </div>
        </section>
        <section className='min-w-0'>
          <p className='mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-muted'>Notifications</p>
          <div className='mb-4 overflow-hidden rounded-2xl bg-surface-muted'>
            <div className='flex items-center justify-between gap-3 border-b border-line px-3.5 py-3'>
              <span className='text-[13.5px]'>Email announcements</span>
              <Toggle
                label="email announcements"
                on={notifyEmailAnnouncements}
                onToggle={() => setNotifyEmailAnnouncements((v) => !v)}
              />
            </div>
            <div className='flex items-center justify-between gap-3 border-b border-line px-3.5 py-3'>
              <span className='text-[13.5px]'>Dues reminders</span>
              <Toggle
                label="dues reminders"
                on={notifyTextDuesReminders}
                onToggle={() => setNotifyTextDuesReminders((v) => !v)}
              />
            </div>
            <div className='flex items-center justify-between gap-3 px-3.5 py-3'>
              <span className='text-[13.5px]'>Election alerts</span>
              <Toggle
                label="election alerts"
                on={notifyElectionAlerts}
                onToggle={() => setNotifyElectionAlerts((v) => !v)}
              />
            </div>
          </div>
        </section>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        aria-busy={saving}
        className='w-full bg-brand disabled:opacity-60 text-on-brand rounded-xl py-3 text-sm font-medium mb-3'
      >
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
      </button>
      {saved && (
        <p role="status" aria-live="polite" className="mb-3 -mt-2 text-center text-xs text-brand-strong">
          Your profile changes are saved.
        </p>
      )}
      {saveError && (
        <p role="alert" className="mb-3 rounded-xl bg-danger-soft px-3 py-2 text-xs text-danger">
          {saveError}
        </p>
      )}

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className='w-full text-danger text-[13.5px] font-medium py-2.5 text-center'
        aria-label="Sign out of your account"
      >
        Sign out
      </button>
      {cropSourceUrl && (
        <ProfilePhotoCropper
          imageUrl={cropSourceUrl}
          onCancel={handleCropCancel}
          onApply={handleCropApply}
        />
      )}
    </div>
  );
}
