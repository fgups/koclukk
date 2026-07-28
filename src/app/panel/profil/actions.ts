"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GradeLevel } from "@/lib/types";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/giris");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const school = String(formData.get("school") ?? "").trim();
  const gradeLevel = String(formData.get("grade_level") ?? "") as GradeLevel | "";
  const birthDate = String(formData.get("birth_date") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const targetDepartment = String(formData.get("target_department") ?? "").trim();
  const targetRank = Number(formData.get("target_rank") ?? "");
  const dailyQuestionGoal = Number(formData.get("daily_question_goal") ?? "");
  const avatarFile = formData.get("avatar") as File | null;

  const updates: Record<string, unknown> = {
    full_name: fullName,
    phone: phone || null,
    school: school || null,
    grade_level: gradeLevel || null,
    birth_date: birthDate || null,
    bio: bio || null,
    target_department: targetDepartment || null,
    target_rank: targetRank > 0 ? targetRank : null,
    daily_question_goal: dailyQuestionGoal > 0 ? dailyQuestionGoal : null,
  };

  if (avatarFile && avatarFile.size > 0) {
    const ext = ALLOWED_IMAGE_TYPES[avatarFile.type];
    if (!ext) {
      redirect("/panel/profil?error=" + encodeURIComponent("Sadece JPG, PNG veya WEBP yükleyebilirsin."));
    }
    if (avatarFile.size > 5 * 1024 * 1024) {
      redirect("/panel/profil?error=" + encodeURIComponent("Fotoğraf en fazla 5MB olabilir."));
    }

    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

    if (uploadError) {
      redirect("/panel/profil?error=" + encodeURIComponent(uploadError.message));
    }

    const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
    updates.avatar_url = `${publicUrl.publicUrl}?v=${Date.now()}`;
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);

  if (error) {
    redirect("/panel/profil?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/panel", "layout");
  redirect("/panel/profil?success=1");
}
