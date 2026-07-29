import Link from "next/link";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { searchPrograms } from "@/lib/yokatlas";

export const metadata = {
  title: "Üniversiteler ve Bölümler | Albatros Koçluk",
  description: "YÖK Atlas verileriyle üniversite/bölümleri taban puan ve başarı sırasına göre karşılaştır.",
};

const PUAN_TURLERI = ["SAY", "EA", "SÖZ", "DİL", "TYT"] as const;
const PAGE_SIZE = 25;

export default async function UniversitelerPage({
  searchParams,
}: {
  searchParams: Promise<{ puanTuru?: string; universiteTuru?: string; page?: string }>;
}) {
  const { puanTuru, universiteTuru, page: pageParam } = await searchParams;
  const page = Math.max(0, Number(pageParam ?? 0) || 0);

  const { content, totalElements, totalPages } = await searchPrograms({
    puanTuru: puanTuru || undefined,
    universiteTuru: universiteTuru === "DEVLET" || universiteTuru === "VAKIF" ? universiteTuru : undefined,
    page,
    size: PAGE_SIZE,
    sortBy: "basariSirasi",
    direction: "ASC",
  });

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (puanTuru) params.set("puanTuru", puanTuru);
    if (universiteTuru) params.set("universiteTuru", universiteTuru);
    params.set("page", String(p));
    return `/universiteler?${params.toString()}`;
  }

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
            <Link href="/net-hesaplayici">
              <Button variant="ghost" size="sm">
                Net Hesaplayıcı
              </Button>
            </Link>
            <Link href="/kayit">
              <Button size="sm">Kayıt Ol</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Üniversiteler ve Bölümler
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {totalElements.toLocaleString("tr-TR")} program · YÖK Atlas 2026 verisi · başarı sırasına göre
              </p>
            </div>
          </div>

          <form className="mt-6 flex flex-wrap gap-3" method="GET">
            <select
              name="puanTuru"
              defaultValue={puanTuru ?? ""}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Tüm Puan Türleri</option>
              {PUAN_TURLERI.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              name="universiteTuru"
              defaultValue={universiteTuru ?? ""}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Devlet + Vakıf</option>
              <option value="DEVLET">Devlet</option>
              <option value="VAKIF">Vakıf</option>
            </select>
            <Button type="submit" size="md">
              Filtrele
            </Button>
          </form>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  <th className="px-4 py-3 font-medium">Üniversite</th>
                  <th className="px-4 py-3 font-medium">Bölüm</th>
                  <th className="px-4 py-3 font-medium">Puan Türü</th>
                  <th className="px-4 py-3 font-medium">Kontenjan</th>
                  <th className="px-4 py-3 font-medium">Taban Puan</th>
                  <th className="px-4 py-3 font-medium">Başarı Sırası</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {content.map((p) => (
                  <tr key={p.kilavuzKodu} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{p.universiteAdi}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{p.birimAdi}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.puanTuru}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.kontenjan}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{p.minPuan?.toFixed(2) ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {p.basariSirasi?.toLocaleString("tr-TR") ?? "—"}
                    </td>
                  </tr>
                ))}
                {content.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      Sonuç bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>
              Sayfa {page + 1} / {Math.max(totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <Link
                href={pageHref(Math.max(0, page - 1))}
                aria-disabled={page === 0}
                className={`flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 dark:border-slate-700 ${page === 0 ? "pointer-events-none opacity-40" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                <ChevronLeft className="h-4 w-4" /> Önceki
              </Link>
              <Link
                href={pageHref(page + 1)}
                aria-disabled={page + 1 >= totalPages}
                className={`flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 dark:border-slate-700 ${page + 1 >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                Sonraki <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
