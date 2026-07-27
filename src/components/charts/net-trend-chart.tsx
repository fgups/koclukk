"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface NetPoint {
  label: string;
  net: number;
}

export function NetTrendChart({ data }: { data: NetPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Henüz deneme kaydı yok.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#475569" }} />
        <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
        <Tooltip formatter={(value) => [`${value} net`, "Toplam Net"]} />
        <Line type="monotone" dataKey="net" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
