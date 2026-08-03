"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
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
    p_value: examDate,
  });
  if (error) {
    redirect("/panel/admin?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/panel", "layout");
  redirect("/panel/admin");
}

export async function approveStudent(formData: FormData) {
  const supabase = await createClient();
  const userId = String(formData.get("user_id") ?? "");

  const { error } = await supabase.rpc("admin_approve_student", { p_user_id: userId });
  if (error) {
    redirect("/panel/admin?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/panel/admin");
  redirect("/panel/admin");
}

export async function sendPasswordReset(formData: FormData) {
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    redirect("/panel/admin?error=" + encodeURIComponent("Yalnızca admin bu işlemi yapabilir."));
  }

  const email = String(formData.get("email") ?? "");
  const headersList = await headers();
  const origin = headersList.get("origin") ?? `https://${headersList.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/sifre-sifirla`,
  });
  if (error) {
    redirect("/panel/admin?error=" + encodeURIComponent(error.message));
  }
  redirect("/panel/admin?success=" + encodeURIComponent(`${email} adresine sıfırlama maili gönderildi.`));
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
