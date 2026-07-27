import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { TRACK_LABELS } from "@/lib/types";

const NAV_BY_ROLE = {
  student: [
    { href: "/panel/ogrenci", label: "Panelim" },
    { href: "/panel/ogrenci/ilerleme", label: "İlerlemem" },
    { href: "/panel/ogrenci/oneriler", label: "AI Önerileri" },
  ],
  coach: [{ href: "/panel/kocluk", label: "Öğrencilerim" }],
  admin: [
    { href: "/panel/kocluk", label: "Öğrenciler" },
    { href: "/panel/admin", label: "Yönetim" },
  ],
} as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const nav = NAV_BY_ROLE[profile.role];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/panel" className="text-lg font-bold text-indigo-600">
              Metropol Koçluk
            </Link>
            <nav className="hidden gap-1 sm:flex">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{profile.full_name || "Kullanıcı"}</p>
              <p className="text-xs text-slate-500">
                {profile.role === "student"
                  ? profile.track
                    ? TRACK_LABELS[profile.track]
                    : "Öğrenci"
                  : profile.role === "coach"
                    ? "Koç"
                    : "Yönetici"}
              </p>
            </div>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Çıkış
              </Button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
