import Link from "next/link";
import { signIn } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AuthShell } from "@/components/auth-shell";

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; next?: string }>;
}) {
  const { error, success, next } = await searchParams;

  return (
    <AuthShell>
      <div className="mb-6 text-center lg:text-left">
        <Link href="/" className="text-xl font-bold text-indigo-600 lg:hidden">
          Albatros Koçluk
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Giriş Yap</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Panelin için giriş yaparak devam et.</p>
      </div>
      <Card>
        <CardContent className="pt-5">
          {success && (
            <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </p>
          )}
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <form action={signIn} className="space-y-4">
            <input type="hidden" name="next" value={next ?? "/panel"} />
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Şifre</Label>
                <Link href="/sifremi-unuttum" className="mb-1.5 text-xs font-medium text-indigo-600 hover:underline">
                  Şifremi unuttum
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Giriş Yap
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="font-medium text-indigo-600 hover:underline">
          Kayıt ol
        </Link>
      </p>
    </AuthShell>
  );
}
