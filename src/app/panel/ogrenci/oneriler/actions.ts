"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getTopicStats } from "@/lib/stats";
import { filterRelevantTopics, pickPriorityTopics, generateRecommendation } from "@/lib/ai/recommend";

export async function createRecommendation() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const stats = await getTopicStats(supabase, profile.id);
  const relevant = filterRelevantTopics(stats, profile.track);
  const priority = pickPriorityTopics(relevant, 6);

  let result: Awaited<ReturnType<typeof generateRecommendation>>;
  try {
    result = await generateRecommendation(profile.full_name, profile.track, priority);
  } catch {
    redirect(
      "/panel/ogrenci/oneriler?error=" +
        encodeURIComponent("Öneri oluşturulamadı. ANTHROPIC_API_KEY doğru tanımlanmış mı kontrol et."),
    );
  }

  const { error } = await supabase.from("ai_recommendations").insert({
    student_id: profile.id,
    recommendation_text: result.recommendation_text,
    focus_topics: result.focus_topics,
  });

  if (error) {
    redirect("/panel/ogrenci/oneriler?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/panel/ogrenci/oneriler");
  redirect("/panel/ogrenci/oneriler");
}
