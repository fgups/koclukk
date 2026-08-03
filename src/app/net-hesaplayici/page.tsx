import Link from "next/link";
import { Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NetCalculator } from "@/components/yokatlas/net-calculator";

export const metadata = {
  title: "Net Hesaplayıcı | Albatros Koçluk",
  description: "YÖK Atlas verileriyle, hedeflediğin üniversite ve bölüme yaklaşık kaç net ile girildiğini gör.",
};

export default function NetHesaplayiciPage() {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm text-white shadow-sm shadow-indigo-600/30">
              AK
            </span>
            Albatros Koçluk
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" />
            <Link href="/universiteler">
              <Button variant="ghost" size="sm">
                Üniversiteler
              </Button>
            </Link>
            <Link href="/kayit">
              <Button size="sm">Kayıt Ol</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20">
              <Calculator className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Net Hesaplayıcı
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Hedeflediğin üniversite ve bölümü seç, YÖK Atlas&apos;ın resmi verisine göre son yerleşen adayın
              yaklaşık netini gör.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <NetCalculator />
          </div>

          <div className="mt-8 flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white shadow-md shadow-indigo-600/20">
            <p className="text-sm font-medium">Hedefini kaydet, çalışmanı ona göre planla.</p>
            <Link href="/kayit">
              <Button variant="secondary" size="sm" className="group">
                Kayıt Ol
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
