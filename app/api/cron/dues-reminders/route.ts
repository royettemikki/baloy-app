import { NextRequest, NextResponse } from 'next/server';
import { runDuesReminderCheck } from '@/lib/duesReminders';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { outcomes } = await runDuesReminderCheck();
  const summary = {
    sent: outcomes.filter((o) => o.status === 'sent').length,
    skipped: outcomes.filter((o) => o.status === 'skipped').length,
    failed: outcomes.filter((o) => o.status === 'failed').length,
  };

  return NextResponse.json(summary);
}
