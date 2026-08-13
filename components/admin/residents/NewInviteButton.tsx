'use client';

import { useState } from 'react';
import InviteForm from './InviteForm';
import { IconX } from '@/components/Icons';

export default function NewInviteButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='bg-brand text-on-brand text-sm font-medium px-4 py-2.5 rounded-xl'
      >
        + New invite
      </button>

      {open && (
        <div
          className='fixed inset-0 z-50 flex justify-end bg-black/30 animate-fadeIn'
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='w-full max-w-sm bg-surface h-full p-6 overflow-y-auto no-scrollbar animate-slideInRight'
          >
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-lg font-medium'>New invite</h2>
              <button
                onClick={() => setOpen(false)}
                className='w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center'
              >
                <IconX width={14} height={14} className='text-ink-soft' />
              </button>
            </div>
            <InviteForm />
          </div>
        </div>
      )}
    </>
  );
}
