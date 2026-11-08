import { NextRequest, NextResponse } from 'next/server';
import { runLateFeeCheck } from '@/lib/lateFees';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const isProduction = process.env.NODE_ENV === 'production';

  const cronSecret = process.env.CRON_SECRET;
  if (isProduction && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { outcomes } = await runLateFeeCheck();
  return NextResponse.json({ applied: outcomes.length });
}
