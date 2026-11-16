'use client';

import { usePathname } from 'next/navigation';
import BackLink from '@/components/BackLink';

export default function ResidentBackNavigation() {
  const pathname = usePathname();

  if (pathname.startsWith('/notices/')) {
    return <BackLink href="/notices">Back to notices</BackLink>;
  }

  if (pathname.startsWith('/dues/')) {
    return <BackLink href="/dues">Back to dues</BackLink>;
  }

  switch (pathname) {
    case '/board':
      return <BackLink href="/home">Back to home</BackLink>;
    case '/results':
      return <BackLink href="/vote">Back to elections</BackLink>;
    case '/file-candidacy':
      return <BackLink href="/vote">Back to elections</BackLink>;
    case '/expense-requests':
    case '/board-approvals':
      return <BackLink href="/home">Back to home</BackLink>;
    default:
      return null;
  }
}
