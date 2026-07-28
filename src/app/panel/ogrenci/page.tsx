import Link from "next/link";
import { Award, CalendarDays, ClipboardList, Flame, Sparkles, Target, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getDailyActivity } from "@/lib/stats";
import { computeCurrentStreak, computeLongestStreak, getBadges } from "@/lib/gamification";
import { QuestionLogForm } from "./log-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeList } from "@/components/gamification/badge-list";
import { StudyHeatmap } from "@/components/progress/study-heatmap";

function startOfWeekISO(): string {
  const now = new Date();
  const day = now.getDay() === 0 ? 7 : now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date(new Date().toDateString());
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export default async function OgrenciDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const profile = await requireProfile();
  const supabase = await createClient();

  const [
    { data: subjects },
    { data: topics },
    { data: recentLogs },
    { data: examDateSetting },
    { data: allLogDates },
    dailyActivity,
  ] = await Promise.all([
    supabase.from("subjects").select("id, name, exam_type").order("exam_type").order("name"),
    supabase.from("topics").select("id, name, subject_id").order("order_index"),
    supabase
      .from("question_logs")
      .select("id, log_date, correct_count, wrong_count, blank_count, topics(name, subjects(name))")
      .eq("student_id", profile.id)
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("app_settings").select("value").eq("key", "exam_date").maybeSingle(),
    supabase.from("question_logs").select("log_date").eq("student_id", profile.id),
    getDailyActivity(supabase, profile.id),
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

  const examDate = (examDateSetting?.value as string | null) ?? null;
  const remainingDays = examDate ? daysUntil(examDate) : null;
  const logDateList = ((allLogDates ?? []) as { log_date: string }[]).map((l) => l.log_date);
  const streak = computeCurrentStreak(logDateList);
  const longestStreak = computeLongestStreak(logDateList);
  const totalSolvedAllTime = Object.values(dailyActivity).reduce((sum, v) => sum + v, 0);
  const badges = getBadges(totalSolvedAllTime, longestStreak);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Merhaba, {profile.full_name || "Öğrenci"} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Bugünkü çalışmanı kaydet, ilerlemeni takip et.</p>
        </div>
        {streak > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
            <Flame className="h-4 w-4" />
            {streak} günlük seri
          </span>
        )}
      </div>

      {remainingDays !== null && remainingDays >= 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-4 text-white shadow-md shadow-indigo-600/20">
          <Target className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            YKS&apos;ye <span className="text-lg font-bold">{remainingDays}</span> gün kaldı
          </p>
        </div>
      )}

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
          <CardContent className="flex items-center gap-4 pt-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Bugün Çözülen</p>
              <p className="text-3xl font-bold text-slate-900">{todayTotal}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Bu Hafta Çözülen</p>
              <p className="text-3xl font-bold text-slate-900">{weekTotal}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
              <Target className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Haftalık Doğruluk</p>
              <p className="text-3xl font-bold text-slate-900">
                {weekAccuracy === null ? "—" : `%${weekAccuracy}`}
              </p>
            </div>
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

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Rozetlerim
            </CardTitle>
            <CardDescription>Çalışma alışkanlığını rozetlerle takip et.</CardDescription>
          </CardHeader>
          <CardContent>
            <BadgeList badges={badges} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              Çalışma Takvimi
            </CardTitle>
            <CardDescription>Son {14 * 7} günün soru çözüm yoğunluğu.</CardDescription>
          </CardHeader>
          <CardContent>
            <StudyHeatmap data={dailyActivity} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 sm:col-span-3 lg:col-span-1">
          <CardContent className="flex items-center justify-between pt-5">
            <div>
              <p className="flex items-center gap-1.5 font-medium text-white">
                <Sparkles className="h-4 w-4" />
                Bugün ne çalışmalıyım?
              </p>
              <p className="mt-0.5 text-sm text-violet-100">Akıllı öneri motorunu görüntüle.</p>
            </div>
            <Link
              href="/panel/ogrenci/oneriler"
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
            >
              Gör
            </Link>
          </CardContent>
        </Card>
        <Link href="/panel/ogrenci/denemeler">
          <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="flex items-center gap-3 pt-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                <Target className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-slate-900">Denemelerim</p>
                <p className="text-sm text-slate-500">Net gelişimini gör</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/panel/ogrenci/gorevler">
          <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="flex items-center gap-3 pt-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-slate-900">Görevlerim</p>
                <p className="text-sm text-slate-500">Koçunun atadıkları</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
