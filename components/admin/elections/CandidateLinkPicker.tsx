'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { linkCandidateAction } from '@/app/actions/elections';

type Resident = { id: string; fullName: string; unit: string };

export default function CandidateLinkPicker({
  candidateId,
  currentHomeownerId,
  residents,
}: {
  candidateId: number;
  currentHomeownerId: string | null;
  residents: Resident[];
}) {
  const [value, setValue] = useState(currentHomeownerId ?? '');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(newValue: string) {
    setValue(newValue);
    startTransition(async () => {
      await linkCandidateAction(candidateId, newValue || null);
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={pending}
      className="rounded-lg border border-line bg-surface px-2 py-1.5 text-xs"
    >
      <option value="">Not linked to an account</option>
      {residents.map((r) => (
        <option key={r.id} value={r.id}>
          {r.fullName} (Unit {r.unit})
        </option>
      ))}
    </select>
  );
}
