import Link from "next/link";
import {
  ClipboardList,
  LineChart,
  Sparkles,
  Users,
  ArrowRight,
  CheckCircle2,
  Flame,
  CheckCheck,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  BookOpen,
  Landmark,
  Globe2,
  Brain,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountUp } from "@/components/count-up";
import { ThemeToggle } from "@/components/theme-toggle";

const STATS = [
  { value: 11, suffix: "", label: "Ders" },
  { value: 174, suffix: "+", label: "Konu" },
  { value: 2, suffix: "", label: "Sınav Türü (TYT & AYT)" },
];

const FAQS = [
  {
    q: "Platforma kayıt olmak ücretli mi?",
    a: "Hayır, öğrenci hesabı oluşturmak tamamen ücretsizdir ve kredi kartı istemez.",
  },
  {
    q: "Koçum kim olacak, nasıl atanıyor?",
    a: "Kayıt olduktan sonra yönetici seni bir koça atar. Koçun; ilerlemeni, çözdüğün soruları ve zayıf olduğun konuları görebilir, seninle doğrudan mesajlaşabilir.",
  },
  {
    q: "Akıllı öneri sistemi tam olarak nasıl çalışıyor?",
    a: "Sistem, hangi konularda az soru çözdüğünü, doğruluk oranının düşük olduğunu ve en son ne zaman çalıştığını analiz ederek her gün için öncelikli konulardan oluşan somut bir çalışma önerisi hazırlar.",
  },
  {
    q: "Verilerim güvende mi, koçum dışında kimse görebilir mi?",
    a: "Hayır. Soru kayıtların ve mesajların yalnızca sana ve sana atanmış koça açıktır; başka öğrenciler veya koçlar erişemez.",
  },
  {
    q: "Telefon veya bilgisayardan kullanabilir miyim?",
    a: "Evet, platform tarayıcı üzerinden çalışır; telefon, tablet veya bilgisayardan ekstra bir uygulama indirmeden kullanabilirsin.",
  },
];

const SUBJECTS = [
  { name: "Türkçe", icon: BookOpen, from: "from-rose-500", to: "to-pink-500" },
  { name: "Matematik", icon: Calculator, from: "from-indigo-500", to: "to-blue-500" },
  { name: "Geometri", icon: Calculator, from: "from-blue-500", to: "to-cyan-500" },
  { name: "Fizik", icon: Atom, from: "from-sky-500", to: "to-indigo-500" },
  { name: "Kimya", icon: FlaskConical, from: "from-emerald-500", to: "to-green-500" },
  { name: "Biyoloji", icon: Dna, from: "from-teal-500", to: "to-emerald-500" },
  { name: "Edebiyat", icon: BookOpen, from: "from-fuchsia-500", to: "to-pink-500" },
  { name: "Tarih", icon: Landmark, from: "from-amber-500", to: "to-yellow-500" },
  { name: "Coğrafya", icon: Globe2, from: "from-lime-500", to: "to-emerald-500" },
  { name: "Felsefe", icon: Brain, from: "from-violet-500", to: "to-purple-500" },
  { name: "Din Kültürü", icon: Languages, from: "from-orange-500", to: "to-amber-500" },
];

const FEATURES = [
  {
    title: "Soru Takip Sistemi",
    description:
      "Öğrenciler her gün çözdükleri soruları derse ve konuya göre kaydeder; doğru, yanlış ve boş sayıları anında raporlanır.",
    icon: ClipboardList,
    from: "from-indigo-500",
    to: "to-blue-500",
  },
  {
    title: "İlerleme Paneli",
    description:
      "TYT ve AYT müfredatındaki her konu için doğruluk oranı, çalışma yoğunluğu ve genel ilerleme tek ekranda.",
    icon: LineChart,
    from: "from-emerald-500",
    to: "to-teal-500",
  },
  {
    title: "Yapay Zeka Önerileri",
    description:
      "Öğrencinin verilerini analiz eden akıllı motor, her gün için somut ve motive edici bir çalışma planı önerir.",
    icon: Sparkles,
    from: "from-violet-500",
    to: "to-fuchsia-500",
  },
  {
    title: "Koç Takip Ekranı",
    description:
      "Koçlar kendilerine atanan öğrencileri tek panelden izler, zayıf konuları görür ve özel notlar bırakır.",
    icon: Users,
    from: "from-amber-500",
    to: "to-orange-500",
  },
];

const STEPS = [
  { title: "Kayıt Ol", description: "Öğrenci hesabını oluştur, alanını (Sayısal, Eşit Ağırlık, Sözel, Dil) seç." },
  { title: "Soru Çöz, Kaydet", description: "Her gün çözdüğün soruları birkaç saniyede sisteme gir." },
  { title: "Takip Et", description: "Koçun ve akıllı öneri motoru, ilerlemene göre seni yönlendirsin." },
];

const MOCK_PROGRESS = [
  { subject: "Matematik", value: 78, color: "bg-indigo-500" },
  { subject: "Fizik", value: 54, color: "bg-amber-500" },
  { subject: "Türkçe", value: 91, color: "bg-emerald-500" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip bg-white dark:bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm text-white shadow-sm shadow-indigo-600/30">
              AK
            </span>
            Albatros Koçluk
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" />
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

      <section className="relative isolate overflow-hidden px-4 pb-24 pt-20">
        <div
          aria-hidden
          className="bg-dot-grid pointer-events-none absolute inset-0 -z-20 opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 -z-10 h-[420px] w-[420px] animate-blob rounded-full bg-gradient-to-br from-indigo-300 to-violet-300 opacity-50 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-0 -z-10 h-[380px] w-[380px] animate-blob-slow rounded-full bg-gradient-to-br from-pink-300 to-amber-200 opacity-40 blur-3xl"
        />

        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              YKS&apos;ye Hazırlanan Öğrenciler İçin
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
              Soru takibinden{" "}
              <span className="text-gradient-brand">akıllı çalışma planına</span>, tek platform
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Albatros Koçluk; öğrencinin çözdüğü soruları, hangi konuda hangi aşamada olduğunu ve
              koçlarının takibini tek bir panelde birleştirir.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/kayit">
                <Button size="lg" className="group">
                  Ücretsiz Başla
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/giris">
                <Button size="lg" variant="outline">
                  Giriş Yap
                </Button>
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              {["Kurulum ücretsiz", "TYT & AYT tam müfredat", "Kredi kartı gerekmez"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative pt-6 pr-6 pb-10 pl-2">
            <div
              aria-hidden
              className="absolute -right-6 -top-6 h-full w-full rounded-2xl bg-gradient-to-br from-indigo-600/15 via-violet-500/10 to-pink-400/15"
            />
            <div
              aria-hidden
              className="animate-float absolute -top-2 -left-2 z-10 hidden items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 px-3 py-2 shadow-lg shadow-amber-900/10 ring-1 ring-slate-100 dark:ring-slate-800 sm:flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <Flame className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">12 gün seri</span>
            </div>
            <div
              aria-hidden
              className="animate-float-delayed absolute -bottom-4 -right-2 z-10 hidden items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 px-3 py-2 shadow-lg shadow-emerald-900/10 ring-1 ring-slate-100 dark:ring-slate-800 sm:flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                <CheckCheck className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Görev tamamlandı</span>
            </div>
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl shadow-indigo-950/10">
              <div className="mb-4 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-medium text-slate-400 dark:text-slate-500">Panelim</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-white p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Bugün</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">42</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-violet-50 to-white p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Bu Hafta</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">286</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-white p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Doğruluk</p>
                  <p className="text-xl font-bold text-emerald-600">%76</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {MOCK_PROGRESS.map((p) => (
                  <div key={p.subject}>
                    <div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{p.subject}</span>
                      <span>%{p.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${p.color}`}
                        style={{ width: `${p.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-gradient-to-br from-violet-50 to-fuchsia-50 p-3 ring-1 ring-inset ring-violet-100">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-violet-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Bugünün Önerisi
                </p>
                <p className="mt-1 text-xs leading-relaxed text-violet-900/80">
                  Fizik &ndash; Elektrik ve Manyetizma konusunda doğruluğun düşük, bugün 15 soru daha
                  çözerek pekiştir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-gradient-brand sm:text-5xl">
                <CountUp target={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Platform Neler Sunuyor?
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Öğrenciyi, koçu ve veriyi aynı ekranda buluşturan dört temel yapı taşı.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="group border-slate-200/80 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/40 dark:border-slate-800/80"
              >
                <CardContent className="pt-6">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.from} ${f.to} text-white shadow-md transition-transform group-hover:scale-110`}
                  >
                    <f.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-20">
        <div
          aria-hidden
          className="bg-dot-grid pointer-events-none absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)]"
        />
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Tüm TYT &amp; AYT Dersleri Tek Yerde
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Hangi dersten çalışırsan çalış, sistem her konuyu ve doğruluğunu ayrı ayrı takip eder.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {SUBJECTS.map((s) => (
              <span
                key={s.name}
                className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${s.from} ${s.to} text-white`}
                >
                  <s.icon className="h-3.5 w-3.5" />
                </span>
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Nasıl Çalışır?
          </h2>
          <div className="relative mt-14 grid gap-10 sm:grid-cols-3">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-pink-200 sm:block"
            />
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="relative mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-600/30 ring-4 ring-slate-50">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Sıkça Sorulan Sorular
          </h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 p-5 shadow-sm shadow-slate-900/5 backdrop-blur-sm open:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-slate-900 dark:text-slate-100">
                  {item.q}
                  <span className="ml-4 shrink-0 text-indigo-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-14 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 animate-blob rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 animate-blob-slow rounded-full bg-amber-300/25 blur-2xl"
          />
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Hazırlığına bugün başla</h2>
          <p className="mx-auto mt-3 max-w-md text-indigo-100">
            Hesabını oluştur, ilk soru kaydını ekle ve akıllı öneri motorunun senin için hazırladığı
            planı gör.
          </p>
          <Link href="/kayit" className="mt-7 inline-block">
            <Button size="lg" variant="secondary">
              Hemen Kayıt Ol
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
          <div>
            <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-violet-600 text-[11px] text-white">
                AK
              </span>
              Albatros Koçluk
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              YKS&apos;ye hazırlanan öğrenciler için soru takibi, ilerleme paneli ve akıllı çalışma
              önerileri sunan koçluk platformu.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Platform</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/kayit" className="hover:text-indigo-600">
                  Öğrenci Kaydı
                </Link>
              </li>
              <li>
                <Link href="/giris" className="hover:text-indigo-600">
                  Giriş Yap
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Dersler</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Türkçe, Matematik, Geometri, Fizik, Kimya, Biyoloji, Edebiyat, Tarih, Coğrafya, Felsefe
              ve Din Kültürü &ndash; tüm TYT &amp; AYT müfredatı.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-slate-200 dark:border-slate-800 pt-6 text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Albatros Koçluk. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}
