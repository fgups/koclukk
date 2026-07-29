import type { SupabaseClient } from "@supabase/supabase-js";
import type { GoalProgress, SubjectNet, Track, TopicStat } from "@/lib/types";
import { TRACK_AYT_SUBJECTS } from "@/lib/types";

/**
 * Tüm müfredat konularını, verilen öğrencinin soru kayıtlarıyla birleştirip
 * her konu için doğruluk oranı ve son çalışma tarihini hesaplar.
 * Hiç çalışılmamış konular da (total=0) listede yer alır.
 */
export async function getTopicStats(
  supabase: SupabaseClient,
  studentId: string,
): Promise<TopicStat[]> {
  const [{ data: topics }, { data: logs }] = await Promise.all([
    supabase
      .from("topics")
      .select("id, name, order_index, subjects(id, name, exam_type)")
      .order("order_index"),
    supabase
      .from("question_logs")
      .select("topic_id, correct_count, wrong_count, blank_count, log_date")
      .eq("student_id", studentId),
  ]);

  type TopicRow = {
    id: string;
    name: string;
    subjects: { id: string; name: string; exam_type: "TYT" | "AYT" } | null;
  };
  type LogRow = {
    topic_id: string;
    correct_count: number;
    wrong_count: number;
    blank_count: number;
    log_date: string;
  };

  const logsByTopic = new Map<string, LogRow[]>();
  for (const log of (logs ?? []) as LogRow[]) {
    const arr = logsByTopic.get(log.topic_id) ?? [];
    arr.push(log);
    logsByTopic.set(log.topic_id, arr);
  }

  return ((topics ?? []) as unknown as TopicRow[])
    .filter((t) => t.subjects)
    .map((topic) => {
      const topicLogs = logsByTopic.get(topic.id) ?? [];
      const correct = topicLogs.reduce((sum, l) => sum + l.correct_count, 0);
      const wrong = topicLogs.reduce((sum, l) => sum + l.wrong_count, 0);
      const blank = topicLogs.reduce((sum, l) => sum + l.blank_count, 0);
      const total = correct + wrong + blank;
      const lastPracticed = topicLogs.length
        ? topicLogs.reduce((latest, l) => (l.log_date > latest ? l.log_date : latest), topicLogs[0].log_date)
        : null;

      return {
        topic_id: topic.id,
        topic_name: topic.name,
        subject_id: topic.subjects!.id,
        subject_name: topic.subjects!.name,
        exam_type: topic.subjects!.exam_type,
        correct,
        wrong,
        blank,
        total,
        accuracy: correct + wrong > 0 ? correct / (correct + wrong) : null,
        last_practiced: lastPracticed,
      };
    });
}

/** Öğrencinin gün bazlı toplam çözdüğü soru sayısı (heatmap için). */
export async function getDailyActivity(
  supabase: SupabaseClient,
  studentId: string,
): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("question_logs")
    .select("log_date, correct_count, wrong_count, blank_count")
    .eq("student_id", studentId);

  const byDate: Record<string, number> = {};
  for (const log of (data ?? []) as {
    log_date: string;
    correct_count: number;
    wrong_count: number;
    blank_count: number;
  }[]) {
    byDate[log.log_date] =
      (byDate[log.log_date] ?? 0) + log.correct_count + log.wrong_count + log.blank_count;
  }
  return byDate;
}

/** Öğrencinin ders bazlı net hedeflerini, en güncel deneme netleriyle birlikte döner. */
export async function getGoalProgress(
  supabase: SupabaseClient,
  studentId: string,
): Promise<GoalProgress[]> {
  const [{ data: goals }, { data: subjects }, { data: exams }] = await Promise.all([
    supabase.from("student_goals").select("subject_id, target_net").eq("student_id", studentId),
    supabase.from("subjects").select("id, name, exam_type"),
    supabase
      .from("mock_exams")
      .select("subject_nets")
      .eq("student_id", studentId)
      .order("exam_date", { ascending: false }),
  ]);

  type GoalRow = { subject_id: string; target_net: number };
  type SubjectRow = { id: string; name: string; exam_type: "TYT" | "AYT" };

  const subjectById = new Map<string, SubjectRow>();
  for (const s of (subjects ?? []) as SubjectRow[]) subjectById.set(s.id, s);

  const latestNetByName = new Map<string, number>();
  for (const exam of (exams ?? []) as { subject_nets: SubjectNet[] }[]) {
    for (const s of exam.subject_nets) {
      if (!latestNetByName.has(s.subject_name)) latestNetByName.set(s.subject_name, s.net);
    }
  }

  return ((goals ?? []) as GoalRow[])
    .map((g) => {
      const subject = subjectById.get(g.subject_id);
      return {
        subject_id: g.subject_id,
        subject_name: subject?.name ?? "Bilinmeyen ders",
        exam_type: subject?.exam_type ?? "TYT",
        target_net: g.target_net,
        current_net: subject ? (latestNetByName.get(subject.name) ?? null) : null,
      };
    })
    .sort((a, b) => a.exam_type.localeCompare(b.exam_type) || a.subject_name.localeCompare(b.subject_name, "tr"));
}

/** Son iki deneme arasındaki net farkını döner (yeterli deneme yoksa null). */
export async function getNetTrend(supabase: SupabaseClient, studentId: string): Promise<number | null> {
  const { data } = await supabase
    .from("mock_exams")
    .select("total_net")
    .eq("student_id", studentId)
    .order("exam_date", { ascending: false })
    .limit(2);

  if (!data || data.length < 2) return null;
  return Math.round((data[0].total_net - data[1].total_net) * 100) / 100;
}

/** Öğrencinin tüm zamanlar toplam doğru/yanlış sayısından genel başarı yüzdesini hesaplar. */
export async function getOverallAccuracy(supabase: SupabaseClient, studentId: string): Promise<number | null> {
  const { data } = await supabase
    .from("question_logs")
    .select("correct_count, wrong_count")
    .eq("student_id", studentId);

  const totals = (data ?? []) as { correct_count: number; wrong_count: number }[];
  const correct = totals.reduce((sum, l) => sum + l.correct_count, 0);
  const wrong = totals.reduce((sum, l) => sum + l.wrong_count, 0);
  return correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : null;
}

/** En son ne zaman soru kaydı eklendiğini (varsa) döner. */
export async function getLastActivityDate(
  supabase: SupabaseClient,
  studentId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("question_logs")
    .select("log_date")
    .eq("student_id", studentId)
    .order("log_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.log_date ?? null;
}

export interface RecentAnalysis {
  windowDays: number;
  totalSolved: number;
  activeDays: number;
  accuracyFirstHalf: number | null;
  accuracySecondHalf: number | null;
  trend: "up" | "down" | "flat" | null;
  topSubject: { name: string; total: number } | null;
  untouchedSubjects: string[];
}

/** Öğrencinin son N günlük çalışma düzenini analiz eder: hacim, doğruluk trendi, ders dağılımı. */
export async function getRecentAnalysis(
  supabase: SupabaseClient,
  studentId: string,
  track: Track | null,
  days = 15,
): Promise<RecentAnalysis> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const sinceISO = since.toISOString().slice(0, 10);
  const midpoint = new Date(since);
  midpoint.setDate(midpoint.getDate() + Math.floor(days / 2));
  const midpointISO = midpoint.toISOString().slice(0, 10);

  const [{ data: logs }, { data: subjects }, { data: topics }] = await Promise.all([
    supabase
      .from("question_logs")
      .select("topic_id, log_date, correct_count, wrong_count, blank_count")
      .eq("student_id", studentId)
      .gte("log_date", sinceISO),
    supabase.from("subjects").select("id, name, exam_type"),
    supabase.from("topics").select("id, subject_id"),
  ]);

  type LogRow = { topic_id: string; log_date: string; correct_count: number; wrong_count: number; blank_count: number };
  type SubjectRow = { id: string; name: string; exam_type: "TYT" | "AYT" };
  type TopicRow = { id: string; subject_id: string };

  const topicToSubject = new Map(((topics ?? []) as TopicRow[]).map((t) => [t.id, t.subject_id]));
  const relevantAytSubjects = track ? new Set(TRACK_AYT_SUBJECTS[track]) : null;
  const relevantSubjects = ((subjects ?? []) as SubjectRow[]).filter(
    (s) => s.exam_type === "TYT" || !relevantAytSubjects || relevantAytSubjects.has(s.name),
  );
  const subjectNameById = new Map(relevantSubjects.map((s) => [s.id, s.name]));

  const bySubject = new Map<string, number>();
  const activeDays = new Set<string>();
  let totalSolved = 0;
  let firstCorrect = 0;
  let firstWrong = 0;
  let secondCorrect = 0;
  let secondWrong = 0;

  for (const log of (logs ?? []) as LogRow[]) {
    const count = log.correct_count + log.wrong_count + log.blank_count;
    totalSolved += count;
    activeDays.add(log.log_date);

    const subjectId = topicToSubject.get(log.topic_id);
    if (subjectId && subjectNameById.has(subjectId)) {
      bySubject.set(subjectId, (bySubject.get(subjectId) ?? 0) + count);
    }

    if (log.log_date < midpointISO) {
      firstCorrect += log.correct_count;
      firstWrong += log.wrong_count;
    } else {
      secondCorrect += log.correct_count;
      secondWrong += log.wrong_count;
    }
  }

  const accuracyFirstHalf = firstCorrect + firstWrong > 0 ? Math.round((firstCorrect / (firstCorrect + firstWrong)) * 100) : null;
  const accuracySecondHalf = secondCorrect + secondWrong > 0 ? Math.round((secondCorrect / (secondCorrect + secondWrong)) * 100) : null;

  let trend: RecentAnalysis["trend"] = null;
  if (accuracyFirstHalf !== null && accuracySecondHalf !== null) {
    const diff = accuracySecondHalf - accuracyFirstHalf;
    trend = diff > 3 ? "up" : diff < -3 ? "down" : "flat";
  }

  let topSubject: RecentAnalysis["topSubject"] = null;
  for (const [subjectId, total] of bySubject) {
    if (!topSubject || total > topSubject.total) {
      topSubject = { name: subjectNameById.get(subjectId) ?? "?", total };
    }
  }

  // Aynı ders adı TYT ve AYT için ayrı satırlar olabilir (örn. "Tarih") — ikisinden
  // biri çalışılmışsa dersi "dokunulmuş" saymak için isme göre karşılaştırıyoruz.
  const touchedNames = new Set(
    [...bySubject.keys()].map((id) => subjectNameById.get(id)).filter((n): n is string => Boolean(n)),
  );
  const untouchedSubjects = [...new Set(relevantSubjects.map((s) => s.name))].filter(
    (name) => !touchedNames.has(name),
  );

  return {
    windowDays: days,
    totalSolved,
    activeDays: activeDays.size,
    accuracyFirstHalf,
    accuracySecondHalf,
    trend,
    topSubject,
    untouchedSubjects,
  };
}
