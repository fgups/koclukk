"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addQuestionLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/giris");

  const topicId = String(formData.get("topic_id") ?? "");
  const logDate = String(formData.get("log_date") ?? new Date().toISOString().slice(0, 10));
  const correct = Number(formData.get("correct_count") ?? 0);
  const wrong = Number(formData.get("wrong_count") ?? 0);
  const blank = Number(formData.get("blank_count") ?? 0);

  if (!topicId) {
    redirect("/panel/ogrenci?error=" + encodeURIComponent("Lütfen bir konu seç."));
  }

  const { error } = await supabase.from("question_logs").insert({
    student_id: user.id,
    topic_id: topicId,
    log_date: logDate,
    correct_count: Math.max(0, correct),
    wrong_count: Math.max(0, wrong),
    blank_count: Math.max(0, blank),
  });

  if (error) {
    redirect("/panel/ogrenci?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/panel/ogrenci");
  revalidatePath("/panel/ogrenci/ilerleme");
  redirect("/panel/ogrenci?success=1");
}
