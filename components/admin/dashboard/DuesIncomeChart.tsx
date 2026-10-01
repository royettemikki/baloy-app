'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function DuesIncomeChart({ data }: { data: { day: string; amount: number }[] }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="duesIncomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-strong)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--brand-strong)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tick={{ fill: 'var(--ink-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--ink-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₱${v >= 1000 ? `${Math.round(v / 1000)}K` : v}`}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-muted)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--ink)',
            }}
            formatter={(value) => [`₱${Number(value).toFixed(2)}`, 'Collected']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="var(--brand-strong)"
            strokeWidth={2}
            fill="url(#duesIncomeFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
