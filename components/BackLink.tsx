import Link from 'next/link';
import { IconChevronDown } from '@/components/Icons';

export default function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-strong transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <IconChevronDown width={14} height={14} className="rotate-90" />
      {children}
    </Link>
  );
}
