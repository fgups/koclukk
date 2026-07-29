import Link from "next/link";
import {
  Award,
  BarChart3,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Flame,
  GraduationCap,
  Percent,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getDailyActivity, getOverallAccuracy } from "@/lib/stats";
import { computeCurrentStreak, computeLongestStreak, getBadges } from "@/lib/gamification";
import { searchPrograms, getNetHistory } from "@/lib/yokatlas";
import { QuestionLogForm } from "./log-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeList } from "@/components/gamification/badge-list";
import { StudyHeatmap } from "@/components/progress/study-heatmap";
import { TaskToggle } from "@/components/tasks/task-toggle";
import { NetTrendChart } from "@/components/charts/net-trend-chart";
import { WeeklyStudyChart } from "@/components/charts/weekly-study-chart";
import { NetHistoryCard } from "@/components/yokatlas/net-history-card";
import type { MockExam, Task } from "@/lib/types";

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

  const weekStart = startOfWeekISO();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { data: subjects },
    { data: topics },
    { data: recentLogs },
    { data: examDateSetting },
    { data: allLogDates },
    dailyActivity,
    overallAccuracy,
    { data: weekLogs },
    { data: openTasks },
    { data: mockExams },
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
    getOverallAccuracy(supabase, profile.id),
    supabase
      .from("question_logs")
      .select("correct_count, wrong_count, blank_count, log_date")
      .eq("student_id", profile.id)
      .gte("log_date", weekStart),
    supabase
      .from("tasks")
      .select("*")
      .eq("student_id", profile.id)
      .eq("is_done", false)
      .order("due_date", { nullsFirst: false })
      .limit(5),
    supabase.from("mock_exams").select("*").eq("student_id", profile.id).order("exam_date"),
  ]);

  const todayTotal = (weekLogs ?? [])
    .filter((l) => l.log_date === today)
    .reduce((sum, l) => sum + l.correct_count + l.wrong_count + l.blank_count, 0);
  const weekTotal = (weekLogs ?? []).reduce(
    (sum, l) => sum + l.correct_count + l.wrong_count + l.blank_count,
    0,
  );

  const examDate = (examDateSetting?.value as string | null) ?? null;
  const remainingDays = examDate ? daysUntil(examDate) : null;
  const logDateList = ((allLogDates ?? []) as { log_date: string }[]).map((l) => l.log_date);
  const streak = computeCurrentStreak(logDateList);
  const longestStreak = computeLongestStreak(logDateList);
  const totalSolvedAllTime = Object.values(dailyActivity).reduce((sum, v) => sum + v, 0);
  const badges = getBadges(totalSolvedAllTime, longestStreak);
  const taskList = (openTasks ?? []) as Task[];

  const examList = (mockExams ?? []) as MockExam[];
  const netChartData = examList.map((e) => ({
    label: new Date(e.exam_date).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
    net: e.total_net,
  }));
  const latestTytNet = [...examList].reverse().find((e) => e.exam_type === "TYT")?.total_net ?? null;
  const latestAytNet = [...examList].reverse().find((e) => e.exam_type === "AYT")?.total_net ?? null;
  const latestExam = examList.length > 0 ? examList[examList.length - 1] : null;

  const weekDayLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const weeklyChartData = weekDayLabels.map((label, i) => {
    const date = new Date(weekStart + "T00:00:00");
    date.setDate(date.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    return { label, count: dailyActivity[key] ?? 0 };
  });

  const dailyGoal = profile.daily_question_goal;
  const dailyGoalPct = dailyGoal ? Math.max(0, Math.min(100, Math.round((todayTotal / dailyGoal) * 100))) : null;

  const hasTarget = Boolean(profile.target_universite_id && profile.target_birim_grup_id);
  let targetCurrent: Awaited<ReturnType<typeof searchPrograms>>["content"][number] | null = null;
  let targetNetHistory: Awaited<ReturnType<typeof getNetHistory>> = [];
  if (hasTarget && profile.target_universite_id && profile.target_birim_grup_id) {
    try {
      const { content } = await searchPrograms({
        universiteId: [profile.target_universite_id],
        birimGrupId: [profile.target_birim_grup_id],
        size: 1,
      });
      targetCurrent = content[0] ?? null;
      const universiteTuru = targetCurrent?.universiteTuru === "VAKIF" ? "VAKIF" : "DEVLET";
      targetNetHistory = await getNetHistory(
        profile.target_universite_id,
        profile.target_birim_grup_id,
        universiteTuru,
        targetCurrent?.birimId,
      );
    } catch {
      targetCurrent = null;
      targetNetHistory = [];
    }
  }

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
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Merhaba, {profile.full_name || "Öğrenci"} 👋</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Bugünkü çalışmanı kaydet, ilerlemeni takip et.</p>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-sm">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Güncel TYT Net</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{latestTytNet ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Güncel AYT Net</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{latestAytNet ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 dark:text-slate-400">Hedef Program</p>
              {hasTarget ? (
                <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {profile.target_birim_grup_adi}
                  <span className="block truncate text-xs font-normal text-slate-500 dark:text-slate-400">
                    {profile.target_universite_adi}
                  </span>
                </p>
              ) : (
                <Link href="/panel/profil" className="text-sm font-medium text-indigo-600 hover:underline">
                  Profilinden belirle
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Güncel Başarı Sırası</p>
              {targetCurrent?.basariSirasi ? (
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {targetCurrent.basariSirasi.toLocaleString("tr-TR")}
                </p>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">—</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {hasTarget && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Hedefim: {profile.target_birim_grup_adi} — {profile.target_universite_adi}
            </CardTitle>
            <CardDescription>YÖK Atlas verisine göre bu programa yaklaşık ne kadar netle girilmiş.</CardDescription>
          </CardHeader>
          <CardContent>
            <NetHistoryCard current={targetCurrent} netHistory={targetNetHistory} />
          </CardContent>
        </Card>
      )}

      {dailyGoal !== null && dailyGoalPct !== null && (
        <Card>
          <CardContent className="space-y-2 pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900 dark:text-slate-100">Bugünkü Hedef</span>
              <span className="text-slate-500 dark:text-slate-400">
                {todayTotal} / {dailyGoal} soru · %{dailyGoalPct}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${dailyGoalPct >= 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                style={{ width: `${dailyGoalPct}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Bugün Çözülen</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{todayTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Bu Hafta Çözülen</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{weekTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Çözülen</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalSolvedAllTime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Genel Başarı</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {overallAccuracy === null ? "—" : `%${overallAccuracy}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-amber-600" />
              Bugünkü Görevler
            </CardTitle>
            <CardDescription>Koçunun sana atadığı, henüz tamamlanmamış görevler.</CardDescription>
          </CardHeader>
          <CardContent>
            {taskList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Bekleyen görevin yok, harika gidiyorsun!</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {taskList.map((task) => (
                  <li key={task.id} className="flex items-start gap-3 py-2.5">
                    <div className="pt-0.5">
                      <TaskToggle taskId={task.id} initialDone={task.is_done} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                      {task.due_date && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Son tarih: {new Date(task.due_date).toLocaleDateString("tr-TR")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/panel/ogrenci/gorevler"
              className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              Tüm görevleri gör →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-indigo-600" />
              Son Deneme Sonucu
            </CardTitle>
            <CardDescription>En son girdiğin deneme.</CardDescription>
          </CardHeader>
          <CardContent>
            {latestExam ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{latestExam.exam_name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {latestExam.exam_type} · {new Date(latestExam.exam_date).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <Badge variant="indigo">{latestExam.total_net} net</Badge>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Henüz deneme kaydı yok.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Haftalık Çalışma Grafiği</CardTitle>
            <CardDescription>Bu haftanın günlük soru çözüm dağılımı.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyStudyChart data={weeklyChartData} />
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Net Gelişimi</CardTitle>
            <CardDescription>Zaman içindeki toplam net değişimin.</CardDescription>
          </CardHeader>
          <CardContent>
            <NetTrendChart data={netChartData} />
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
              <p className="text-sm text-slate-500 dark:text-slate-400">Henüz kayıt eklemedin.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {(recentLogs as unknown as RecentLog[]).map((log) => (
                  <li key={log.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{log.topics?.name ?? "Konu"}</p>
                      <p className="text-slate-500 dark:text-slate-400">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 sm:col-span-2 lg:col-span-1">
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
              className="rounded-lg bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
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
                <p className="font-medium text-slate-900 dark:text-slate-100">Denemelerim</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Net gelişimini gör</p>
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
                <p className="font-medium text-slate-900 dark:text-slate-100">Görevlerim</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Koçunun atadıkları</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/panel/ogrenci/pomodoro">
          <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="flex items-center gap-3 pt-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm">
                <Timer className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Pomodoro</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Odaklanarak çalış</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
