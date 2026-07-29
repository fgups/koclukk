"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface SubjectAccuracy {
  subject: string;
  accuracy: number;
  total: number;
}

export function SubjectAccuracyChart({ data }: { data: SubjectAccuracy[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Henüz grafik için yeterli veri yok.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="subject" tick={{ fontSize: 12, fill: "#475569" }} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#475569" }} unit="%" />
        <Tooltip
          formatter={(value, _name, item) => [
            `%${value} doğruluk (${item.payload.total} soru)`,
            "Doğruluk",
          ]}
        />
        <Bar dataKey="accuracy" fill="#4f46e5" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
