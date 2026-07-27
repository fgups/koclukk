import Link from "next/link";
import { Sparkles, ClipboardList, LineChart } from "lucide-react";

const POINTS = [
  { icon: ClipboardList, text: "Soru çözümlerini saniyeler içinde kaydet" },
  { icon: LineChart, text: "Konu bazlı ilerlemeni anlık gör" },
  { icon: Sparkles, text: "Akıllı öneri motoru sana yol göstersin" },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-indigo-600 px-10 py-16 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-amber-300/20 blur-2xl"
        />
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-sm">
            MK
          </span>
          Metropol Koçluk
        </Link>
        <div className="max-w-sm">
          <h2 className="text-3xl font-bold leading-tight text-white">
            YKS hazırlığını veriyle yönet
          </h2>
          <ul className="mt-8 space-y-5">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-start gap-3 text-indigo-50">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <p.icon className="h-4 w-4" />
                </span>
                <span className="leading-relaxed">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-indigo-200">© {new Date().getFullYear()} Metropol Koçluk</p>
      </div>

      <div className="flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
