import Link from "next/link";
import { Clock3 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PanelNav } from "@/components/panel-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { getNotifications } from "@/lib/notifications";
import { TRACK_LABELS } from "@/lib/types";

const WHATSAPP_NUMBER = "905540049028";
const WHATSAPP_MESSAGE = "Merhaba, Albatros Koçluk üyeliğimi onaylatmak istiyorum.";

const NAV_BY_ROLE = {
  student: [
    { href: "/panel/ogrenci", label: "Panelim" },
    { href: "/panel/ogrenci/ilerleme", label: "İlerlemem" },
    { href: "/panel/ogrenci/denemeler", label: "Denemelerim" },
    { href: "/panel/ogrenci/gorevler", label: "Görevlerim" },
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

  if (!profile.approved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-600/20">
            <Clock3 className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">Hesabın Onay Bekliyor</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Kaydın alındı. Üyeliğini aktifleştirmek için ödemeni yapıp WhatsApp&apos;tan bize ulaş, en kısa sürede
            onaylayıp panele erişimini açalım.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            WhatsApp&apos;tan Ulaş
          </a>
          <form action={signOut} className="mt-3">
            <Button variant="outline" size="sm" type="submit" className="w-full">
              Çıkış Yap
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const nav = NAV_BY_ROLE[profile.role];

  const supabase = await createClient();
  const [{ count: unreadCount }, notifications] = await Promise.all([
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .or(`coach_id.eq.${profile.id},student_id.eq.${profile.id}`)
      .neq("sender_id", profile.id)
      .is("read_at", null),
    getNotifications(supabase, profile),
  ]);

  const badges: Record<string, number> | undefined =
    profile.role === "student"
      ? { "/panel/ogrenci/mesajlar": unreadCount ?? 0 }
      : profile.role === "coach"
        ? { "/panel/kocluk": unreadCount ?? 0 }
        : undefined;
  const initials = (profile.full_name || "?")
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/panel" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm text-white shadow-sm shadow-indigo-600/30">
                AK
              </span>
              <span className="hidden sm:inline">Albatros Koçluk</span>
            </Link>
            <PanelNav items={nav} className="hidden gap-1 sm:flex" badges={badges} />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{profile.full_name || "Kullanıcı"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
                className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-900"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
                {initials}
              </span>
            )}
            <NotificationBell items={notifications} />
            <ThemeToggle />
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Çıkış
              </Button>
            </form>
          </div>
        </div>
        <PanelNav
          items={nav}
          className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 dark:border-slate-800 sm:hidden"
          badges={badges}
        />
      </header>
      <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
