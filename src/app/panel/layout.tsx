import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { PanelNav } from "@/components/panel-nav";
import { TRACK_LABELS } from "@/lib/types";

const NAV_BY_ROLE = {
  student: [
    { href: "/panel/ogrenci", label: "Panelim" },
    { href: "/panel/ogrenci/ilerleme", label: "İlerlemem" },
    { href: "/panel/ogrenci/oneriler", label: "AI Önerileri" },
    { href: "/panel/ogrenci/mesajlar", label: "Mesajlar" },
    { href: "/panel/profil", label: "Profilim" },
  ],
  coach: [
    { href: "/panel/kocluk", label: "Öğrencilerim" },
    { href: "/panel/profil", label: "Profilim" },
  ],
  admin: [
    { href: "/panel/kocluk", label: "Öğrenciler" },
    { href: "/panel/admin", label: "Yönetim" },
    { href: "/panel/profil", label: "Profilim" },
  ],
} as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const nav = NAV_BY_ROLE[profile.role];
  const initials = (profile.full_name || "?")
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/panel" className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
                MK
              </span>
              <span className="hidden sm:inline">Metropol Koçluk</span>
            </Link>
            <PanelNav items={nav} className="hidden gap-1 sm:flex" />
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
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                {initials}
              </span>
            )}
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Çıkış
              </Button>
            </form>
          </div>
        </div>
        <PanelNav
          items={nav}
          className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden"
        />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
