'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { updateProfileAction } from '@/app/actions/profile';
import ThemeToggle from '@/components/ui/ThemeToggle';

type Profile = {
  fullName: string;
  unit: string;
  email: string;
  phoneNumber: string;
  emergencyContact: string;
  ownerSince: number;
  notifyEmailAnnouncements: boolean;
  notifyTextDuesReminders: boolean;
  notifyElectionAlerts: boolean;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [emergencyContact, setEmergencyContact] = useState(
    profile.emergencyContact,
  );
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

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await updateProfileAction({
      fullName,
      phoneNumber,
      emergencyContact,
      notifyEmailAnnouncements,
      notifyTextDuesReminders,
      notifyElectionAlerts,
    });
    setSaving(false);
    setSaved(true);
  }

  function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
      <button
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
      <div className='flex flex-col items-center text-center mb-[18px]'>
        <div className='w-16 h-16 rounded-full bg-accentwarm-soft flex items-center justify-center text-xl font-semibold text-accentwarm mb-2.5'>
          {initials}
        </div>
        <p className='text-base font-medium'>{fullName}</p>
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
              <span className='shrink-0 text-[13.5px] text-ink-soft'>Phone</span>
              <input
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setSaved(false);
                }}
                placeholder='Add a phone number'
                className='min-w-0 flex-1 bg-transparent text-right text-[13.5px] outline-none'
              />
            </div>
            <div className='flex items-center gap-3 py-3'>
              <span className='shrink-0 text-[13.5px] text-ink-soft'>Emergency contact</span>
              <input
                value={emergencyContact}
                onChange={(e) => {
                  setEmergencyContact(e.target.value);
                  setSaved(false);
                }}
                placeholder='Add a contact'
                className='min-w-0 flex-1 bg-transparent text-right text-[13.5px] outline-none'
              />
            </div>
          </div>
        </section>
        <section className='min-w-0'>
          <p className='mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-muted'>Notifications</p>
          <div className='mb-4 overflow-hidden rounded-2xl bg-surface-muted'>
            <div className='flex items-center justify-between gap-3 border-b border-line px-3.5 py-3'>
              <span className='text-[13.5px]'>Email announcements</span>
              <Toggle
                on={notifyEmailAnnouncements}
                onToggle={() => setNotifyEmailAnnouncements((v) => !v)}
              />
            </div>
            <div className='flex items-center justify-between gap-3 border-b border-line px-3.5 py-3'>
              <span className='text-[13.5px]'>Dues reminders</span>
              <Toggle
                on={notifyTextDuesReminders}
                onToggle={() => setNotifyTextDuesReminders((v) => !v)}
              />
            </div>
            <div className='flex items-center justify-between gap-3 px-3.5 py-3'>
              <span className='text-[13.5px]'>Election alerts</span>
              <Toggle
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
        className='w-full bg-brand disabled:opacity-60 text-on-brand rounded-xl py-3 text-sm font-medium mb-3'
      >
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
      </button>

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className='w-full text-danger text-[13.5px] font-medium py-2.5 text-center'
      >
        Sign out
      </button>
    </div>
  );
}
