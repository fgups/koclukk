"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addCoachNote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/giris");

  const studentId = String(formData.get("student_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!note || !studentId) {
    redirect(`/panel/kocluk/${studentId}?error=${encodeURIComponent("Not boş olamaz.")}`);
  }

  const { error } = await supabase.from("coach_notes").insert({
    coach_id: user.id,
    student_id: studentId,
    note,
  });

  if (error) {
    redirect(`/panel/kocluk/${studentId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/panel/kocluk/${studentId}`);
  redirect(`/panel/kocluk/${studentId}`);
}

export async function assignTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/giris");

  const studentId = String(formData.get("student_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();

  if (!title || !studentId) {
    redirect(`/panel/kocluk/${studentId}?error=${encodeURIComponent("Görev başlığı boş olamaz.")}`);
  }

  const { error } = await supabase.from("tasks").insert({
    coach_id: user.id,
    student_id: studentId,
    title,
    description: description || null,
    due_date: dueDate || null,
  });

  if (error) {
    redirect(`/panel/kocluk/${studentId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/panel/kocluk/${studentId}`);
  redirect(`/panel/kocluk/${studentId}`);
}
