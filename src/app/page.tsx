import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    title: "Soru Takip Sistemi",
    description:
      "Öğrenciler her gün çözdükleri soruları derse ve konuya göre kaydeder; doğru, yanlış ve boş sayıları anında raporlanır.",
    icon: "📊",
  },
  {
    title: "İlerleme Paneli",
    description:
      "TYT ve AYT müfredatındaki her konu için doğruluk oranı, çalışma yoğunluğu ve genel ilerleme tek ekranda.",
    icon: "📈",
  },
  {
    title: "Yapay Zeka Önerileri",
    description:
      "Öğrencinin verilerini analiz eden yapay zeka, her gün için somut ve motive edici bir çalışma planı önerir.",
    icon: "🤖",
  },
  {
    title: "Koç Takip Ekranı",
    description:
      "Koçlar kendilerine atanan öğrencileri tek panelden izler, zayıf konuları görür ve özel notlar bırakır.",
    icon: "🎯",
  },
];

const STEPS = [
  { title: "Kayıt Ol", description: "Öğrenci hesabını oluştur, alanını (Sayısal, Eşit Ağırlık, Sözel, Dil) seç." },
  { title: "Soru Çöz, Kaydet", description: "Her gün çözdüğün soruları birkaç saniyede sisteme gir." },
  { title: "Takip Et", description: "Koçun ve yapay zeka, ilerlemene göre seni yönlendirsin." },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-bold text-indigo-600">Metropol Koçluk</span>
          <div className="flex items-center gap-2">
            <Link href="/giris">
              <Button variant="ghost" size="sm">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/kayit">
              <Button size="sm">Kayıt Ol</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-indigo-50 to-white px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            YKS&apos;ye Hazırlanan Öğrenciler İçin
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Soru takibinden yapay zeka destekli çalışma planına, tek platform
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
            Metropol Koçluk; öğrencinin çözdüğü soruları, hangi konuda hangi aşamada olduğunu ve
            koçlarının takibini tek bir profesyonel panelde birleştirir.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/kayit">
              <Button size="lg">Ücretsiz Başla</Button>
            </Link>
            <Link href="/giris">
              <Button size="lg" variant="outline">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold text-slate-900">Platform Neler Sunuyor?</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardContent className="pt-5">
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-semibold text-slate-900">Nasıl Çalışır?</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl bg-indigo-600 px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">Hazırlığına bugün başla</h2>
          <p className="mt-2 text-indigo-100">
            Hesabını oluştur, ilk soru kaydını ekle ve yapay zekanın senin için hazırladığı öneriyi gör.
          </p>
          <Link href="/kayit" className="mt-6 inline-block">
            <Button size="lg" variant="secondary">
              Hemen Kayıt Ol
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Metropol Koçluk. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
