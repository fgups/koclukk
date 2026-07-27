import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubjectAccuracyChart } from "@/components/charts/progress-chart";
import type { TopicStat } from "@/lib/types";

function statusFor(total: number, accuracy: number | null) {
  if (total === 0) return { label: "Başlanmadı", variant: "neutral" as const };
  if ((accuracy ?? 0) < 0.5) return { label: "Zayıf", variant: "danger" as const };
  if ((accuracy ?? 0) < 0.75) return { label: "Gelişiyor", variant: "warning" as const };
  return { label: "İyi", variant: "success" as const };
}

export function TopicProgressView({
  stats,
  chartDescription = "Şimdiye kadar en az 1 soru çözülen dersler.",
}: {
  stats: TopicStat[];
  chartDescription?: string;
}) {
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Derslere Göre Doğruluk</CardTitle>
          <CardDescription>{chartDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectAccuracyChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konu Bazlı Durum</CardTitle>
          <CardDescription>Tüm TYT/AYT müfredatındaki konuların durumu (doğru / yanlış / boş dahil).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Ders</th>
                  <th className="pb-2 pr-4 font-medium">Konu</th>
                  <th className="pb-2 pr-4 font-medium">Doğru</th>
                  <th className="pb-2 pr-4 font-medium">Yanlış</th>
                  <th className="pb-2 pr-4 font-medium">Boş</th>
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
                      <td className="py-2 pr-4 text-emerald-700">{t.correct}</td>
                      <td className="py-2 pr-4 text-red-700">{t.wrong}</td>
                      <td className="py-2 pr-4 text-slate-500">{t.blank}</td>
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
    </>
  );
}
