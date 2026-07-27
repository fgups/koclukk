import { LineChart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getTopicStats } from "@/lib/stats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubjectAccuracyChart } from "@/components/charts/progress-chart";

function statusFor(total: number, accuracy: number | null) {
  if (total === 0) return { label: "Başlanmadı", variant: "neutral" as const };
  if ((accuracy ?? 0) < 0.5) return { label: "Zayıf", variant: "danger" as const };
  if ((accuracy ?? 0) < 0.75) return { label: "Gelişiyor", variant: "warning" as const };
  return { label: "İyi", variant: "success" as const };
}

export default async function IlerlemePage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const stats = await getTopicStats(supabase, profile.id);

  const bySubject = new Map<string, { correct: number; wrong: number; total: number }>();
  for (const t of stats) {
    const cur = bySubject.get(t.subject_name) ?? { correct: 0, wrong: 0, total: 0 };
    cur.correct += t.correct;
    cur.wrong += t.wrong;
    cur.total += t.total;
    bySubject.set(t.subject_name, cur);
  }
  const chartData = [...bySubject.entries()]
    .filter(([, v]) => v.correct + v.wrong > 0)
    .map(([subject, v]) => ({
      subject,
      accuracy: Math.round((v.correct / (v.correct + v.wrong)) * 100),
      total: v.total,
    }));

  const totalSolved = stats.reduce((sum, t) => sum + t.total, 0);
  const startedTopics = stats.filter((t) => t.total > 0).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-sm">
            <LineChart className="h-5 w-5" />
          </span>
          İlerlemem
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Toplam {totalSolved} soru çözdün, {startedTopics}/{stats.length} konuya başladın.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Derslere Göre Doğruluk</CardTitle>
          <CardDescription>Şimdiye kadar en az 1 soru çözdüğün dersler.</CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectAccuracyChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konu Bazlı Durum</CardTitle>
          <CardDescription>Tüm TYT/AYT müfredatındaki konuların durumu.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Ders</th>
                  <th className="pb-2 pr-4 font-medium">Konu</th>
                  <th className="pb-2 pr-4 font-medium">Çözülen</th>
                  <th className="pb-2 pr-4 font-medium">Doğruluk</th>
                  <th className="pb-2 pr-4 font-medium">Son Çalışma</th>
                  <th className="pb-2 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.map((t) => {
                  const status = statusFor(t.total, t.accuracy);
                  return (
                    <tr key={t.topic_id} className="hover:bg-slate-50">
                      <td className="py-2 pr-4 whitespace-nowrap text-slate-500">
                        {t.subject_name} <span className="text-xs">({t.exam_type})</span>
                      </td>
                      <td className="py-2 pr-4 font-medium text-slate-900">{t.topic_name}</td>
                      <td className="py-2 pr-4 text-slate-700">{t.total}</td>
                      <td className="py-2 pr-4 text-slate-700">
                        {t.accuracy === null ? "—" : `%${Math.round(t.accuracy * 100)}`}
                      </td>
                      <td className="py-2 pr-4 text-slate-500">{t.last_practiced ?? "—"}</td>
                      <td className="py-2">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
