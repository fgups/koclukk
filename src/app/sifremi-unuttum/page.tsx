import Link from "next/link";
import { requestPasswordReset } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AuthShell } from "@/components/auth-shell";

export default async function SifremiUnuttumPage({
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
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Şifremi Unuttum</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          E-posta adresini gir, sana bir şifre sıfırlama bağlantısı gönderelim.
        </p>
      </div>
      <Card>
        <CardContent className="pt-5">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <form action={requestPasswordReset} className="space-y-4">
            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <Button type="submit" className="w-full">
              Sıfırlama Bağlantısı Gönder
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        <Link href="/giris" className="font-medium text-indigo-600 hover:underline">
          Girişe dön
        </Link>
      </p>
    </AuthShell>
  );
}
