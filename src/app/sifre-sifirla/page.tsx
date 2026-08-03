"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AuthShell } from "@/components/auth-shell";

export default function SifreSifirlaPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [validLink, setValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setValidLink(Boolean(data.session));
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (password !== password2) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/giris"), 2000);
  }

  return (
    <AuthShell>
      <div className="mb-6 text-center lg:text-left">
        <Link href="/" className="text-xl font-bold text-indigo-600 lg:hidden">
          Albatros Koçluk
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Yeni Şifre Belirle</h1>
      </div>
      <Card>
        <CardContent className="pt-5">
          {checking ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Kontrol ediliyor...</p>
          ) : !validLink ? (
            <div className="space-y-3">
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Bağlantı geçersiz veya süresi dolmuş. Tekrar şifre sıfırlama isteği gönder.
              </p>
              <Link href="/sifremi-unuttum" className="text-sm font-medium text-indigo-600 hover:underline">
                Şifremi Unuttum sayfasına dön
              </Link>
            </div>
          ) : success ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Şifren güncellendi, girişe yönlendiriliyorsun...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div>
                <Label htmlFor="password">Yeni Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label htmlFor="password2">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="password2"
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Kaydediliyor..." : "Şifreyi Güncelle"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  );
}
