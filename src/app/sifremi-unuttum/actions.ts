"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    redirect("/sifremi-unuttum?error=" + encodeURIComponent("E-posta adresi gerekli."));
  }

  const headersList = await headers();
  const origin = headersList.get("origin") ?? `https://${headersList.get("host")}`;

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/sifre-sifirla`,
  });

  // Kayıtlı olsun olmasın aynı mesajı gösteriyoruz — hangi e-postaların
  // sistemde olduğunu dışarıya sızdırmamak için.
  redirect(
    "/giris?success=" +
      encodeURIComponent("E-posta adresine kayıtlıysa bir şifre sıfırlama bağlantısı gönderildi."),
  );
}
