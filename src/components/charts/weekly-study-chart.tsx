"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface DayPoint {
  label: string;
  count: number;
}

export function WeeklyStudyChart({ data }: { data: DayPoint[] }) {
  const hasData = data.some((d) => d.count > 0);
  if (!hasData) {
    return <p className="text-sm text-slate-500">Son 7 günde henüz kayıt yok.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#475569" }} />
        <YAxis tick={{ fontSize: 12, fill: "#475569" }} allowDecimals={false} />
        <Tooltip formatter={(value) => [`${value} soru`, "Çözülen"]} />
        <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
