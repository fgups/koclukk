"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Track } from "@/lib/types";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const track = String(formData.get("track") ?? "") as Track | "";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        track: track || null,
      },
    },
  });

  if (error) {
    redirect(`/kayit?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    redirect("/panel");
  }

  redirect("/giris?success=" + encodeURIComponent("Kayıt başarılı. E-postanı onayladıktan sonra giriş yapabilirsin."));
}
