"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export async function setRole(formData: FormData) {
  const supabase = await createClient();
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  const { error } = await supabase.rpc("admin_set_role", { target_user: userId, new_role: role });
  if (error) {
    redirect("/panel/admin?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/panel/admin");
  redirect("/panel/admin");
}

export async function assignStudent(formData: FormData) {
  const supabase = await createClient();
  const coachId = String(formData.get("coach_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");

  const { error } = await supabase.rpc("admin_assign_student", {
    p_coach_id: coachId,
    p_student_id: studentId,
  });
  if (error) {
    redirect("/panel/admin?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/panel/admin");
  redirect("/panel/admin");
}

export async function setExamDate(formData: FormData) {
  const supabase = await createClient();
  const examDate = String(formData.get("exam_date") ?? "");

  const { error } = await supabase.rpc("admin_set_setting", {
    p_key: "exam_date",
    p_value: JSON.stringify(examDate),
  });
  if (error) {
    redirect("/panel/admin?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/panel", "layout");
  redirect("/panel/admin");
}

export async function unassignStudent(formData: FormData) {
  const supabase = await createClient();
  const coachId = String(formData.get("coach_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");

  const { error } = await supabase.rpc("admin_unassign_student", {
    p_coach_id: coachId,
    p_student_id: studentId,
  });
  if (error) {
    redirect("/panel/admin?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/panel/admin");
  redirect("/panel/admin");
}
