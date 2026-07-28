import { notFound } from "next/navigation";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getTopicStats, getDailyActivity, getLastActivityDate, getGoalProgress } from "@/lib/stats";
import { addCoachNote, assignTask } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { MessageThread } from "@/components/chat/message-thread";
import { NetTrendChart } from "@/components/charts/net-trend-chart";
import { TaskToggle } from "@/components/tasks/task-toggle";
import { TopicProgressView } from "@/components/progress/topic-progress-view";
import { MockExamList } from "@/components/progress/mock-exam-list";
import { StudyHeatmap } from "@/components/progress/study-heatmap";
import { GoalProgressList } from "@/components/progress/goal-progress-list";
import { TRACK_LABELS, GRADE_LEVEL_LABELS } from "@/lib/types";
import type { CoachNote, Message, MockExam, Profile, Task } from "@/lib/types";

const INACTIVITY_WARNING_DAYS = 3;

function daysSince(dateStr: string): number {
  const then = new Date(dateStr + "T00:00:00");
  const today = new Date(new Date().toDateString());
  return Math.round((today.getTime() - then.getTime()) / 86400000);
}

type RecentLog = {
  id: string;
  log_date: string;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  topics: { name: string; subjects: { name: string } | null } | null;
};

export default async function OgrenciDetayPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { studentId } = await params;
  const { error } = await searchParams;
  const viewer = await requireProfile();
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", studentId)
    .single();

  if (!student) notFound();

  const [
    stats,
    { data: notes },
    { data: messages },
    { data: mockExams },
    { data: tasks },
    { data: recentLogs },
    dailyActivity,
    lastActivity,
    goalProgress,
  ] = await Promise.all([
    getTopicStats(supabase, studentId),
    supabase
      .from("coach_notes")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
    viewer.role === "coach"
      ? supabase
          .from("messages")
          .select("*")
          .eq("coach_id", viewer.id)
          .eq("student_id", studentId)
          .order("created_at")
      : Promise.resolve({ data: null }),
    supabase.from("mock_exams").select("*").eq("student_id", studentId).order("exam_date"),
    supabase.from("tasks").select("*").eq("student_id", studentId).order("created_at", { ascending: false }),
    supabase
      .from("question_logs")
      .select("id, log_date, correct_count, wrong_count, blank_count, topics(name, subjects(name))")
      .eq("student_id", studentId)
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(15),
    getDailyActivity(supabase, studentId),
    getLastActivityDate(supabase, studentId),
    getGoalProgress(supabase, studentId),
  ]);

  const inactiveDays = lastActivity ? daysSince(lastActivity) : null;

  const weakTopics = [...stats]
    .filter((t) => t.total > 0)
    .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))
    .slice(0, 5);
  const untouchedCount = stats.filter((t) => t.total === 0).length;
  const total = stats.reduce((sum, t) => sum + t.total, 0);

  const examList = (mockExams ?? []) as MockExam[];
  const netChartData = examList.map((e) => ({
    label: new Date(e.exam_date).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
    net: e.total_net,
  }));
  const taskList = (tasks ?? []) as Task[];

  const s = student as Profile;
  const initials = (s.full_name || "?")
    .trim()
    .split(/\s+/)
    .map((c) => c[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        {s.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.avatar_url} alt={s.full_name} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
            {initials}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{s.full_name || "İsimsiz Öğrenci"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {s.track ? TRACK_LABELS[s.track] : "Alan belirtilmemiş"}
            {" · "}Toplam {total} soru çözülmüş, {untouchedCount} konuya hiç başlanmamış
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            {s.school && <span>🏫 {s.school}</span>}
            {s.grade_level && <span>{GRADE_LEVEL_LABELS[s.grade_level]}</span>}
            {s.phone && <span>📞 {s.phone}</span>}
          </p>
          {s.bio && <p className="mt-2 max-w-xl text-sm text-slate-600">{s.bio}</p>}
          {inactiveDays !== null && inactiveDays >= INACTIVITY_WARNING_DAYS && (
            <div className="mt-2 flex w-fit items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {inactiveDays} gündür çalışmıyor
            </div>
          )}
        </div>
      </div>

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

      <TopicProgressView
        stats={stats}
        chartDescription="Öğrencinin en az 1 soru çözdüğü dersler."
      />

      <Card>
        <CardHeader>
          <CardTitle>Son Kayıtlar</CardTitle>
          <CardDescription>Öğrencinin en son eklediği 15 soru kaydı.</CardDescription>
        </CardHeader>
        <CardContent>
          {!recentLogs || recentLogs.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz soru kaydı eklenmedi.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Deneme Sonuçları</CardTitle>
          <CardDescription>Öğrencinin net gelişimi ve ders bazlı dökümü.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <NetTrendChart data={netChartData} />
          <MockExamList exams={examList} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Net Hedefleri</CardTitle>
          <CardDescription>Öğrencinin kendi belirlediği ders bazlı hedeflere göre ilerlemesi.</CardDescription>
        </CardHeader>
        <CardContent>
          <GoalProgressList goals={goalProgress} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Görevler</CardTitle>
          <CardDescription>Öğrenciye görev ata, tamamlanma durumunu takip et.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {viewer.role === "coach" && (
            <form action={assignTask} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <input type="hidden" name="student_id" value={studentId} />
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Başlık</label>
                <Input name="title" placeholder="Örn. 20 türev sorusu çöz" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Son Tarih (opsiyonel)</label>
                <Input name="due_date" type="date" />
              </div>
              <Button type="submit" size="sm">
                Görev Ata
              </Button>
            </form>
          )}
          <ul className="divide-y divide-slate-100">
            {taskList.map((task) => (
              <li key={task.id} className="flex items-start gap-3 py-3">
                <div className="pt-0.5">
                  <TaskToggle taskId={task.id} initialDone={task.is_done} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.is_done ? "text-slate-400 line-through" : "text-slate-900"}`}>
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="text-xs text-slate-500">
                      Son tarih: {new Date(task.due_date).toLocaleDateString("tr-TR")}
                    </p>
                  )}
                </div>
              </li>
            ))}
            {taskList.length === 0 && (
              <li className="py-3 text-sm text-slate-500">Henüz görev atanmadı.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      {viewer.role === "coach" && (
        <Card>
          <CardHeader>
            <CardTitle>Mesajlar</CardTitle>
            <CardDescription>Öğrenciyle doğrudan yazış.</CardDescription>
          </CardHeader>
          <CardContent>
            <MessageThread
              coachId={viewer.id}
              studentId={studentId}
              currentUserId={viewer.id}
              initialMessages={(messages ?? []) as Message[]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
