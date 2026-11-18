import { redirect } from 'next/navigation';
import DevToolsPanel from '@/components/admin/devTools/DevToolsPanel';
import { getFeatureVisibilityState } from '@/lib/featureVisibility';

export default async function DevToolsPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/admin');
  }
  const featureSettings = await getFeatureVisibilityState();

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-strong">
          Developer workspace
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Dev tools</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Run local checks, manage sample data, and configure test accounts. Start with the category
          you need below.
        </p>
        <div className="border-warning/20 bg-warning-soft/60 mt-5 flex gap-3 rounded-2xl border p-4">
          <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-warning" />
          <div>
            <p className="text-xs font-semibold text-warning">Local development only</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Some actions permanently delete real data. This page is unavailable in production;
              review each confirmation before running a destructive action.
            </p>
          </div>
        </div>
      </header>
      <DevToolsPanel featureSettings={featureSettings} />
    </div>
  );
}
