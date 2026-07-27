import Anthropic from "@anthropic-ai/sdk";
import type { Track, TopicStat, AiRecommendation } from "@/lib/types";
import { TRACK_LABELS } from "@/lib/types";

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

/**
 * Kural tabanlı önceliklendirmenin çıktısını Claude API ile öğrenciye yönelik,
 * motive edici ve somut bir Türkçe çalışma önerisine çevirir.
 */
export async function generateRecommendation(
  fullName: string,
  track: Track | null,
  priorityTopics: TopicStat[],
): Promise<GenerateResult> {
  const focusTopics = priorityTopics.slice(0, 3).map((t) => ({
    topic_name: t.topic_name,
    subject_name: t.subject_name,
    reason:
      t.total === 0
        ? "Bu konudan hiç soru çözülmemiş."
        : `Son kayıtlarda doğruluk oranı %${Math.round((t.accuracy ?? 0) * 100)}${
            t.last_practiced ? `, son çalışma: ${t.last_practiced}` : ""
          }.`,
  }));

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const statsSummary = priorityTopics
    .slice(0, 8)
    .map((t) => {
      const acc = t.accuracy === null ? "veri yok" : `%${Math.round(t.accuracy * 100)} doğruluk`;
      return `- ${t.subject_name} / ${t.topic_name} (${t.exam_type}): ${t.total} soru çözülmüş, ${acc}, son çalışma: ${
        t.last_practiced ?? "hiç"
      }`;
    })
    .join("\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    system:
      "Sen bir YKS koçluk asistanısın. Öğrencinin soru çözüm istatistiklerine bakarak bugün için kısa, somut, " +
      "motive edici bir Türkçe çalışma planı yazıyorsun. En fazla 120 kelime kullan, madde işaretleri kullanabilirsin. " +
      "Asla veri uydurma, sadece sana verilen istatistiklere dayan.",
    messages: [
      {
        role: "user",
        content: `Öğrenci: ${fullName || "Öğrenci"}\nAlan: ${track ? TRACK_LABELS[track] : "belirtilmemiş"}\n\nÖncelikli konu istatistikleri:\n${statsSummary || "Henüz hiç soru kaydı yok."}\n\nBu bilgilere göre bugün için bir çalışma önerisi yaz.`,
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return {
    recommendation_text: text || "Bugün için öneri oluşturulamadı, lütfen tekrar dene.",
    focus_topics: focusTopics,
  };
}
