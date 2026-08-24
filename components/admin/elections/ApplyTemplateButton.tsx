'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { applyPositionTemplateAction } from '@/app/actions/elections';

export default function ApplyTemplateButton({ electionId }: { electionId: number }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    setMessage(null);
    startTransition(async () => {
      const result = await applyPositionTemplateAction(electionId);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage(
        `Added ${result.addedCount} standard position${result.addedCount === 1 ? '' : 's'}.`,
      );
      router.refresh();
    });
  }

  return (
    <div className="mb-3">
      <button
        onClick={handleClick}
        disabled={pending}
        className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-brand disabled:opacity-60"
      >
        {pending ? 'Adding…' : '+ Use standard board template'}
      </button>
      {message && <p className="mt-1.5 text-xs text-ink-muted">{message}</p>}
    </div>
  );
}
