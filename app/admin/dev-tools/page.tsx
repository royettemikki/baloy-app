import { redirect } from 'next/navigation';
import DevToolsPanel from '@/components/admin/devTools/DevToolsPanel';

export default function DevToolsPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/admin');
  }

  return (
    <div>
      <div className="border-warning/20 mb-6 rounded-2xl border bg-warning-soft p-4">
        <p className="mb-1 text-sm font-medium text-warning">Local development only</p>
        <p className="text-xs text-ink-soft">
          These tools delete and recreate real data. They only work when running locally — this page
          redirects away entirely on the live production app.
        </p>
      </div>
      <DevToolsPanel />
    </div>
  );
}
