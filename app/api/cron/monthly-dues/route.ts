import { NextRequest, NextResponse } from 'next/server';
import { generateMonthlyDues } from '@/lib/monthlyDues';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === 'production' && (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await generateMonthlyDues();
  return NextResponse.json(result);
}
