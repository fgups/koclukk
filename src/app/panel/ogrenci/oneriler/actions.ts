"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getTopicStats, getRecentAnalysis } from "@/lib/stats";
import { filterRelevantTopics, pickPriorityTopics, generateRecommendation } from "@/lib/ai/recommend";

export async function createRecommendation() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const [stats, analysis] = await Promise.all([
    getTopicStats(supabase, profile.id),
    getRecentAnalysis(supabase, profile.id, profile.track),
  ]);
  const relevant = filterRelevantTopics(stats, profile.track);
  const priority = pickPriorityTopics(relevant, 6);
  const result = generateRecommendation(profile.full_name, profile.track, priority, analysis);

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
