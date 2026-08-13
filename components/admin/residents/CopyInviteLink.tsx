'use client';

import { useState } from 'react';

export default function CopyInviteLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const link = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={handleCopy} className="text-xs font-medium text-brand">
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
}