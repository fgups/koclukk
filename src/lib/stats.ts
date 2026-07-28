import type { SupabaseClient } from "@supabase/supabase-js";
import type { GoalProgress, SubjectNet, TopicStat } from "@/lib/types";

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
