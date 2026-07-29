import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubjectAccuracyChart } from "@/components/charts/progress-chart";
import type { ExamType, TopicStat } from "@/lib/types";

function statusFor(total: number, accuracy: number | null) {
  if (total === 0) return { label: "Başlanmadı", variant: "neutral" as const };
  if ((accuracy ?? 0) < 0.5) return { label: "Zayıf", variant: "danger" as const };
  if ((accuracy ?? 0) < 0.75) return { label: "Gelişiyor", variant: "warning" as const };
  return { label: "İyi", variant: "success" as const };
}

interface SubjectGroup {
  subject_name: string;
  exam_type: ExamType;
  topics: TopicStat[];
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

  const groupsByKey = new Map<string, SubjectGroup>();
  for (const t of stats) {
    const key = `${t.subject_name}__${t.exam_type}`;
    const group = groupsByKey.get(key) ?? { subject_name: t.subject_name, exam_type: t.exam_type, topics: [] };
    group.topics.push(t);
    groupsByKey.set(key, group);
  }
  const groups = [...groupsByKey.values()].sort((a, b) => {
    if (a.exam_type !== b.exam_type) return a.exam_type === "TYT" ? -1 : 1;
    return a.subject_name.localeCompare(b.subject_name, "tr");
  });

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
          <CardDescription>
            Tüm TYT/AYT müfredatındaki konuların durumu (doğru / yanlış / boş dahil). Bir dersi açmak için
            üzerine tıkla.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {groups.map((group) => {
            const started = group.topics.filter((t) => t.total > 0).length;
            const correctSum = group.topics.reduce((s, t) => s + t.correct, 0);
            const wrongSum = group.topics.reduce((s, t) => s + t.wrong, 0);
            const groupAccuracy =
              correctSum + wrongSum > 0 ? Math.round((correctSum / (correctSum + wrongSum)) * 100) : null;

            return (
              <details
                key={`${group.subject_name}-${group.exam_type}`}
                className="group rounded-lg border border-slate-200 dark:border-slate-800"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {group.subject_name}{" "}
                    <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({group.exam_type})</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {started}/{group.topics.length} konu
                    </span>
                    {groupAccuracy !== null && (
                      <Badge variant={groupAccuracy < 50 ? "danger" : groupAccuracy < 75 ? "warning" : "success"}>
                        %{groupAccuracy}
                      </Badge>
                    )}
                    <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform group-open:rotate-180" />
                  </span>
                </summary>
                <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800 px-4 pb-3 pt-2">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="pb-2 pr-4 font-medium">Konu</th>
                        <th className="pb-2 pr-4 font-medium">Doğru</th>
                        <th className="pb-2 pr-4 font-medium">Yanlış</th>
                        <th className="pb-2 pr-4 font-medium">Boş</th>
                        <th className="pb-2 pr-4 font-medium">Doğruluk</th>
                        <th className="pb-2 pr-4 font-medium">Son Çalışma</th>
                        <th className="pb-2 font-medium">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {group.topics.map((t) => {
                        const status = statusFor(t.total, t.accuracy);
                        return (
                          <tr key={t.topic_id} className="hover:bg-slate-50">
                            <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">{t.topic_name}</td>
                            <td className="py-2 pr-4 text-emerald-700">{t.correct}</td>
                            <td className="py-2 pr-4 text-red-700">{t.wrong}</td>
                            <td className="py-2 pr-4 text-slate-500 dark:text-slate-400">{t.blank}</td>
                            <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                              {t.accuracy === null ? "—" : `%${Math.round(t.accuracy * 100)}`}
                            </td>
                            <td className="py-2 pr-4 text-slate-500 dark:text-slate-400">{t.last_practiced ?? "—"}</td>
                            <td className="py-2">
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
