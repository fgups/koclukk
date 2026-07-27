import Link from "next/link";
import { redirect } from "next/navigation";
import { Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getTopicStats } from "@/lib/stats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRACK_LABELS } from "@/lib/types";
import type { Profile } from "@/lib/types";

export default async function KocPanelPage() {
  const profile = await requireProfile();
  if (profile.role === "student") redirect("/panel/ogrenci");

  const supabase = await createClient();

  let students: Profile[] = [];
  if (profile.role === "admin") {
    const { data } = await supabase.from("profiles").select("*").eq("role", "student");
    students = (data ?? []) as Profile[];
  } else {
    const { data } = await supabase
      .from("coach_students")
      .select("profiles!coach_students_student_id_fkey(*)")
      .eq("coach_id", profile.id);
    students = ((data ?? []) as unknown as { profiles: Profile }[]).map((r) => r.profiles);
  }

  const summaries = await Promise.all(
    students.map(async (student) => {
      const stats = await getTopicStats(supabase, student.id);
      const total = stats.reduce((sum, t) => sum + t.total, 0);
      const correct = stats.reduce((sum, t) => sum + t.correct, 0);
      const wrong = stats.reduce((sum, t) => sum + t.wrong, 0);
      const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : null;
      const weakest = [...stats]
        .filter((t) => t.total > 0)
        .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))[0];
      return { student, total, accuracy, weakest };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
            <Users2 className="h-5 w-5" />
          </span>
          Öğrencilerim
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {students.length} öğrenci takip ediyorsun.
        </p>
      </div>

      {summaries.length === 0 ? (
        <Card>
          <CardContent className="pt-5 text-sm text-slate-500">
            Sana atanmış bir öğrenci bulunmuyor. Yönetici seni bir öğrenciye atayabilir.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map(({ student, total, accuracy, weakest }) => (
            <Link key={student.id} href={`/panel/kocluk/${student.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  {student.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={student.avatar_url}
                      alt={student.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                      {(student.full_name || "?")
                        .trim()
                        .split(/\s+/)
                        .map((c) => c[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}
                  <div>
                    <CardTitle>{student.full_name || "İsimsiz Öğrenci"}</CardTitle>
                    <CardDescription>
                      {student.track ? TRACK_LABELS[student.track] : "Alan belirtilmemiş"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Toplam çözülen</span>
                    <span className="font-medium text-slate-900">{total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Doğruluk</span>
                    <span className="font-medium text-slate-900">
                      {accuracy === null ? "—" : `%${accuracy}`}
                    </span>
                  </div>
                  {weakest && (
                    <div className="pt-1">
                      <Badge variant="warning">En zayıf: {weakest.topic_name}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
