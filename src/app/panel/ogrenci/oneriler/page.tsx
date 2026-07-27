import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { createRecommendation } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AiRecommendation } from "@/lib/types";

export default async function OnerilerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: recommendations } = await supabase
    .from("ai_recommendations")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const list = (recommendations ?? []) as AiRecommendation[];
  const latest = list[0];
  const history = list.slice(1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">AI Önerileri</h1>
          <p className="mt-1 text-sm text-slate-500">
            Soru çözüm verilerine göre oluşturulan günlük çalışma önerileri.
          </p>
        </div>
        <form action={createRecommendation}>
          <Button type="submit">Yeni Öneri Oluştur</Button>
        </form>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {!latest ? (
        <Card>
          <CardContent className="pt-5 text-sm text-slate-500">
            Henüz bir öneri oluşturulmadı. Birkaç soru kaydı ekledikten sonra &quot;Yeni Öneri
            Oluştur&quot; butonuna basarak ilk önerini alabilirsin.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-indigo-200 bg-indigo-50/40">
          <CardHeader>
            <CardTitle>Bugünün Önerisi</CardTitle>
            <CardDescription>{new Date(latest.created_at).toLocaleString("tr-TR")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
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
                <li key={rec.id} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                  <p className="mb-1 text-xs text-slate-400">
                    {new Date(rec.created_at).toLocaleString("tr-TR")}
                  </p>
                  <p className="whitespace-pre-line text-sm text-slate-700">{rec.recommendation_text}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
