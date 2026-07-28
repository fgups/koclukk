"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ExamType, SubjectNet } from "@/lib/types";

export async function addMockExam(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/giris");

  const examName = String(formData.get("exam_name") ?? "").trim();
  const examType = String(formData.get("exam_type") ?? "") as ExamType;
  const examDate = String(formData.get("exam_date") ?? "");
  const subjectNames = formData.getAll("subject_name") as string[];
  const corrects = formData.getAll("correct") as string[];
  const wrongs = formData.getAll("wrong") as string[];

  if (!examName || !examType) {
    redirect("/panel/ogrenci/denemeler?error=" + encodeURIComponent("Deneme adı ve türü zorunlu."));
  }

  const subjectNets: SubjectNet[] = subjectNames.map((name, i) => {
    const correct = Math.max(0, Number(corrects[i] ?? 0));
    const wrong = Math.max(0, Number(wrongs[i] ?? 0));
    const net = Math.round((correct - wrong / 4) * 100) / 100;
    return { subject_name: name, correct, wrong, net };
  });

  const totalNet = Math.round(subjectNets.reduce((sum, s) => sum + s.net, 0) * 100) / 100;

  const { error } = await supabase.from("mock_exams").insert({
    student_id: user.id,
    exam_name: examName,
    exam_type: examType,
    exam_date: examDate || new Date().toISOString().slice(0, 10),
    subject_nets: subjectNets,
    total_net: totalNet,
  });

  if (error) {
    redirect("/panel/ogrenci/denemeler?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/panel/ogrenci/denemeler");
  redirect("/panel/ogrenci/denemeler?success=exam");
}

export async function setGoals(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/giris");

  const toUpsert: { student_id: string; subject_id: string; target_net: number }[] = [];
  const toDelete: string[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("target_")) continue;
    const subjectId = key.slice("target_".length);
    const num = Number(value);
    if (value !== "" && !Number.isNaN(num) && num > 0) {
      toUpsert.push({ student_id: user.id, subject_id: subjectId, target_net: Math.round(num * 100) / 100 });
    } else {
      toDelete.push(subjectId);
    }
  }

  if (toUpsert.length > 0) {
    const { error } = await supabase
      .from("student_goals")
      .upsert(toUpsert, { onConflict: "student_id,subject_id" });
    if (error) {
      redirect("/panel/ogrenci/denemeler?error=" + encodeURIComponent(error.message));
    }
  }
  if (toDelete.length > 0) {
    await supabase.from("student_goals").delete().eq("student_id", user.id).in("subject_id", toDelete);
  }

  revalidatePath("/panel/ogrenci/denemeler");
  redirect("/panel/ogrenci/denemeler?success=goals");
}
