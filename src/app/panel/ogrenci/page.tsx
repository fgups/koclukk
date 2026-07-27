import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { QuestionLogForm } from "./log-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function startOfWeekISO(): string {
  const now = new Date();
  const day = now.getDay() === 0 ? 7 : now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

export default async function OgrenciDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: subjects }, { data: topics }, { data: recentLogs }] = await Promise.all([
    supabase.from("subjects").select("id, name, exam_type").order("exam_type").order("name"),
    supabase.from("topics").select("id, name, subject_id").order("order_index"),
    supabase
      .from("question_logs")
      .select("id, log_date, correct_count, wrong_count, blank_count, topics(name, subjects(name))")
      .eq("student_id", profile.id)
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const weekStart = startOfWeekISO();
  const today = new Date().toISOString().slice(0, 10);

  const { data: weekLogs } = await supabase
    .from("question_logs")
    .select("correct_count, wrong_count, blank_count, log_date")
    .eq("student_id", profile.id)
    .gte("log_date", weekStart);

  const todayTotal = (weekLogs ?? [])
    .filter((l) => l.log_date === today)
    .reduce((sum, l) => sum + l.correct_count + l.wrong_count + l.blank_count, 0);
  const weekTotal = (weekLogs ?? []).reduce(
    (sum, l) => sum + l.correct_count + l.wrong_count + l.blank_count,
    0,
  );
  const weekCorrect = (weekLogs ?? []).reduce((sum, l) => sum + l.correct_count, 0);
  const weekWrong = (weekLogs ?? []).reduce((sum, l) => sum + l.wrong_count, 0);
  const weekAccuracy =
    weekCorrect + weekWrong > 0 ? Math.round((weekCorrect / (weekCorrect + weekWrong)) * 100) : null;

  type RecentLog = {
    id: string;
    log_date: string;
    correct_count: number;
    wrong_count: number;
    blank_count: number;
    topics: { name: string; subjects: { name: string } | null } | null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Merhaba, {profile.full_name || "Öğrenci"} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Bugünkü çalışmanı kaydet, ilerlemeni takip et.</p>
      </div>

      {success && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Kayıt başarıyla eklendi.
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Bugün Çözülen</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{todayTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Bu Hafta Çözülen</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{weekTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Haftalık Doğruluk</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {weekAccuracy === null ? "—" : `%${weekAccuracy}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Soru Kaydı Ekle</CardTitle>
            <CardDescription>Çözdüğün soruları derse ve konuya göre kaydet.</CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionLogForm subjects={subjects ?? []} topics={topics ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Kayıtlar</CardTitle>
            <CardDescription>En son eklediğin 10 kayıt.</CardDescription>
          </CardHeader>
          <CardContent>
            {!recentLogs || recentLogs.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz kayıt eklemedin.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {(recentLogs as unknown as RecentLog[]).map((log) => (
                  <li key={log.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{log.topics?.name ?? "Konu"}</p>
                      <p className="text-slate-500">
                        {log.topics?.subjects?.name} · {log.log_date}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge variant="success">{log.correct_count} D</Badge>
                      <Badge variant="danger">{log.wrong_count} Y</Badge>
                      <Badge variant="neutral">{log.blank_count} B</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-indigo-200 bg-indigo-50/50">
        <CardContent className="flex items-center justify-between pt-5">
          <div>
            <p className="font-medium text-indigo-900">Bugün ne çalışmalıyım?</p>
            <p className="text-sm text-indigo-700">
              Verilerine göre yapay zeka destekli günlük çalışma önerini gör.
            </p>
          </div>
          <Link
            href="/panel/ogrenci/oneriler"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Öneriyi Gör
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
