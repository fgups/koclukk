import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getTopicStats } from "@/lib/stats";
import { addCoachNote } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { TRACK_LABELS } from "@/lib/types";
import type { CoachNote, Profile } from "@/lib/types";

export default async function OgrenciDetayPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { studentId } = await params;
  const { error } = await searchParams;
  await requireProfile();
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", studentId)
    .single();

  if (!student) notFound();

  const [stats, { data: notes }] = await Promise.all([
    getTopicStats(supabase, studentId),
    supabase
      .from("coach_notes")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
  ]);

  const weakTopics = [...stats]
    .filter((t) => t.total > 0)
    .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))
    .slice(0, 5);
  const untouchedCount = stats.filter((t) => t.total === 0).length;
  const total = stats.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {(student as Profile).full_name || "İsimsiz Öğrenci"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {(student as Profile).track ? TRACK_LABELS[(student as Profile).track!] : "Alan belirtilmemiş"}
          {" · "}Toplam {total} soru çözülmüş, {untouchedCount} konuya hiç başlanmamış
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>En Zayıf Konular</CardTitle>
          <CardDescription>Doğruluk oranı en düşük 5 konu.</CardDescription>
        </CardHeader>
        <CardContent>
          {weakTopics.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz yeterli veri yok.</p>
          ) : (
            <ul className="space-y-2">
              {weakTopics.map((t) => (
                <li key={t.topic_id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-800">
                    {t.subject_name} · {t.topic_name}
                  </span>
                  <Badge variant={((t.accuracy ?? 0) < 0.5 ? "danger" : "warning") as "danger" | "warning"}>
                    %{Math.round((t.accuracy ?? 0) * 100)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Koç Notları</CardTitle>
          <CardDescription>Bu notlar sadece koçlar ve yöneticiler tarafından görülür.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <form action={addCoachNote} className="space-y-2">
            <input type="hidden" name="student_id" value={studentId} />
            <Textarea name="note" placeholder="Öğrenci hakkında bir not bırak..." required />
            <Button type="submit" size="sm">
              Not Ekle
            </Button>
          </form>
          <ul className="space-y-3 border-t border-slate-100 pt-4">
            {((notes ?? []) as CoachNote[]).map((n) => (
              <li key={n.id} className="text-sm">
                <p className="text-slate-800">{n.note}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {new Date(n.created_at).toLocaleString("tr-TR")}
                </p>
              </li>
            ))}
            {(!notes || notes.length === 0) && (
              <li className="text-sm text-slate-500">Henüz not eklenmedi.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
