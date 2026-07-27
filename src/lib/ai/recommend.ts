import type { Track, TopicStat, AiRecommendation } from "@/lib/types";

// AYT'de öğrencinin alanına göre hangi derslerin onu ilgilendirdiği (basitleştirilmiş eşleme).
const TRACK_AYT_SUBJECTS: Record<Track, string[]> = {
  sayisal: ["Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji"],
  esit_agirlik: ["Matematik", "Geometri", "Edebiyat", "Tarih", "Coğrafya"],
  sozel: ["Edebiyat", "Tarih", "Coğrafya"],
  dil: [],
};

export function filterRelevantTopics(stats: TopicStat[], track: Track | null): TopicStat[] {
  if (!track) return stats;
  const aytSubjects = new Set(TRACK_AYT_SUBJECTS[track]);
  return stats.filter((t) => t.exam_type === "TYT" || aytSubjects.has(t.subject_name));
}

function scoreTopic(t: TopicStat, today: Date): number {
  if (t.total === 0) return 55;
  const accuracy = t.accuracy ?? 0;
  const daysSince = t.last_practiced
    ? Math.floor((today.getTime() - new Date(t.last_practiced).getTime()) / 86400000)
    : 999;
  const weaknessScore = (1 - accuracy) * 60;
  const stalenessScore = Math.min(daysSince, 30);
  const volumeConfidence = Math.min(t.total, 20) / 20;
  return weaknessScore * (0.5 + 0.5 * volumeConfidence) + stalenessScore;
}

/** Kural tabanlı motor: en öncelikli (zayıf/eski/hiç çalışılmamış) konuları seçer. */
export function pickPriorityTopics(stats: TopicStat[], limit = 5): TopicStat[] {
  const today = new Date();
  return [...stats]
    .sort((a, b) => scoreTopic(b, today) - scoreTopic(a, today))
    .slice(0, limit);
}

interface GenerateResult {
  recommendation_text: string;
  focus_topics: AiRecommendation["focus_topics"];
}

function suggestionLine(t: TopicStat): string {
  if (t.total === 0) {
    return `**${t.subject_name} – ${t.topic_name}**: Bu konudan hiç soru çözülmemiş. Konuyu kısaca tekrar edip 15-20 soru çözerek başla.`;
  }
  const accuracy = t.accuracy ?? 0;
  if (accuracy < 0.5) {
    return `**${t.subject_name} – ${t.topic_name}**: Doğruluk oranın %${Math.round(accuracy * 100)}. Önce yanlışlarını gözden geçir, ardından 15-20 soru daha çöz.`;
  }
  if (t.last_practiced) {
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(t.last_practiced).getTime()) / 86400000,
    );
    if (daysSince >= 7) {
      return `**${t.subject_name} – ${t.topic_name}**: Son çalışmandan bu yana ${daysSince} gün geçmiş. Unutmamak için 10-15 soruluk bir tekrar yap.`;
    }
  }
  return `**${t.subject_name} – ${t.topic_name}**: Doğruluk oranın %${Math.round(accuracy * 100)}. Bu tempoyu korumak için 10 soru daha çöz.`;
}

const CLOSING_LINES = [
  "Küçük ama düzenli adımlar büyük farkı yaratır, bugün de bir adım at!",
  "Az ve öz çalışsan bile istikrarlı olursan ilerleme kesin.",
  "Bugünkü hedefini tamamladığında yarın bir adım daha öndesin.",
];

/**
 * Kural tabanlı önceliklendirmenin çıktısını, dışarıya API çağrısı yapmadan
 * öğrenciye yönelik somut bir Türkçe günlük çalışma önerisine çevirir.
 */
export function generateRecommendation(
  fullName: string,
  _track: Track | null,
  priorityTopics: TopicStat[],
): GenerateResult {
  const top = priorityTopics.slice(0, 3);

  const focusTopics = top.map((t) => ({
    topic_name: t.topic_name,
    subject_name: t.subject_name,
    reason:
      t.total === 0
        ? "Bu konudan hiç soru çözülmemiş."
        : `Doğruluk oranı %${Math.round((t.accuracy ?? 0) * 100)}${
            t.last_practiced ? `, son çalışma: ${t.last_practiced}` : ""
          }.`,
  }));

  if (top.length === 0) {
    return {
      recommendation_text:
        "Henüz bir soru kaydın yok. Bugün birkaç soru çözüp kaydet, bir sonraki önerini o verilere göre hazırlayalım.",
      focus_topics: [],
    };
  }

  const name = fullName || "Merhaba";
  const intro = `${name}, bugünkü çalışma önerin:`;
  const lines = top.map((t, i) => `${i + 1}. ${suggestionLine(t)}`);
  const closing = CLOSING_LINES[Math.floor(Math.random() * CLOSING_LINES.length)];

  return {
    recommendation_text: [intro, ...lines, "", closing].join("\n"),
    focus_topics: focusTopics,
  };
}
