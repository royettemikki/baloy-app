import Link from 'next/link';

export default function ReportTabs({ active }: { active: 'cash-flow' | 'compliance' }) {
  return (
    <div className="flex gap-2 border-b border-line">
      <Link
        href="/admin/reports/cash-flow"
        className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${
          active === 'cash-flow'
            ? 'border-brand text-brand-strong'
            : 'border-transparent text-ink-soft'
        }`}
      >
        Cash Flow
      </Link>
      <Link
        href="/admin/reports/compliance"
        className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${
          active === 'compliance'
            ? 'border-brand text-brand-strong'
            : 'border-transparent text-ink-soft'
        }`}
      >
        Dues Compliance
      </Link>
    </div>
  );
}
