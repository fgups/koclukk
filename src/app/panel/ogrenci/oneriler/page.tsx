import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getRecentAnalysis } from "@/lib/stats";
import { createRecommendation } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecentAnalysisCard } from "@/components/progress/recent-analysis-card";
import type { AiRecommendation } from "@/lib/types";

export default async function OnerilerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: recommendations }, analysis] = await Promise.all([
    supabase
      .from("ai_recommendations")
      .select("*")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10),
    getRecentAnalysis(supabase, profile.id, profile.track),
  ]);

  const list = (recommendations ?? []) as AiRecommendation[];
  const latest = list[0];
  const history = list.slice(1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            AI Önerileri
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Soru çözüm verilerine göre oluşturulan günlük çalışma önerileri.
          </p>
        </div>
        <form action={createRecommendation}>
          <Button type="submit">Yeni Öneri Oluştur</Button>
        </form>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Son {analysis.windowDays} Gün Analizi</CardTitle>
          <CardDescription>Çalışma hacmin, doğruluk trendin ve ders dağılımın.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentAnalysisCard analysis={analysis} />
        </CardContent>
      </Card>

      {!latest ? (
        <Card>
          <CardContent className="pt-5 text-sm text-slate-500 dark:text-slate-400">
            Henüz bir öneri oluşturulmadı. Birkaç soru kaydı ekledikten sonra &quot;Yeni Öneri
            Oluştur&quot; butonuna basarak ilk önerini alabilirsin.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 via-fuchsia-50/60 to-white dark:border-violet-900 dark:from-violet-950 dark:via-fuchsia-950/60 dark:to-slate-900">
          <CardHeader>
            <CardTitle>Bugünün Önerisi</CardTitle>
            <CardDescription>{new Date(latest.created_at).toLocaleString("tr-TR")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {latest.recommendation_text}
            </p>
            {latest.focus_topics?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {latest.focus_topics.map((t, i) => (
                  <Badge key={i} variant="indigo">
                    {t.subject_name} · {t.topic_name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Geçmiş Öneriler</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {history.map((rec) => (
                <li key={rec.id} className="border-t border-slate-100 dark:border-slate-800 pt-4 first:border-0 first:pt-0">
                  <p className="mb-1 text-xs text-slate-400 dark:text-slate-500">
                    {new Date(rec.created_at).toLocaleString("tr-TR")}
                  </p>
                  <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">{rec.recommendation_text}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
