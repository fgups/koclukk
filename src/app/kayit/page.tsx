import Link from "next/link";
import { signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AuthShell } from "@/components/auth-shell";
import { TRACK_LABELS } from "@/lib/types";

export default async function KayitPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell>
      <div className="mb-6 text-center lg:text-left">
        <Link href="/" className="text-xl font-bold text-indigo-600 lg:hidden">
          Albatros Koçluk
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Öğrenci Kaydı</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Soru takibini ve ilerlemeni görmek için hesap oluştur.
        </p>
      </div>
      <Card>
        <CardContent className="pt-5">
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <form action={signUp} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Ad Soyad</Label>
              <Input id="full_name" name="full_name" required autoComplete="name" />
            </div>
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="track">Alan</Label>
              <Select id="track" name="track" defaultValue="">
                <option value="" disabled>
                  Alanını seç
                </option>
                {Object.entries(TRACK_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Kayıt Ol
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-medium text-indigo-600 hover:underline">
          Giriş yap
        </Link>
      </p>
    </AuthShell>
  );
}
