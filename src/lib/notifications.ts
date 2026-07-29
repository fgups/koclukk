import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

export interface NotificationItem {
  id: string;
  type: "message" | "task";
  title: string;
  subtitle: string;
  href: string;
  date: string;
}

type UnreadMessageRow = {
  coach_id: string;
  student_id: string;
  body: string;
  created_at: string;
  sender: { full_name: string } | null;
};

/** Okunmamış mesaj threadleri (kişi başı en güncel mesaj) + öğrenci için yaklaşan/geciken görevler. */
export async function getNotifications(supabase: SupabaseClient, profile: Profile): Promise<NotificationItem[]> {
  const isStudent = profile.role === "student";

  const messagesQuery = supabase
    .from("messages")
    .select("coach_id, student_id, body, created_at, sender:profiles!messages_sender_id_fkey(full_name)")
    .neq("sender_id", profile.id)
    .is("read_at", null)
    .order("created_at", { ascending: false });

  const { data: unreadMessages } = isStudent
    ? await messagesQuery.eq("student_id", profile.id)
    : await messagesQuery.eq("coach_id", profile.id);

  const messageThreads = new Map<string, NotificationItem>();
  for (const m of (unreadMessages ?? []) as unknown as UnreadMessageRow[]) {
    const counterpart = isStudent ? m.coach_id : m.student_id;
    if (messageThreads.has(counterpart)) continue;
    messageThreads.set(counterpart, {
      id: `message-${counterpart}`,
      type: "message",
      title: m.sender?.full_name || "Yeni mesaj",
      subtitle: m.body.length > 60 ? `${m.body.slice(0, 60)}…` : m.body,
      href: isStudent ? "/panel/ogrenci/mesajlar" : `/panel/kocluk/${m.student_id}`,
      date: m.created_at,
    });
  }

  const items: NotificationItem[] = [...messageThreads.values()];

  if (isStudent) {
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);
    const { data: dueTasks } = await supabase
      .from("tasks")
      .select("id, title, due_date")
      .eq("student_id", profile.id)
      .eq("is_done", false)
      .not("due_date", "is", null)
      .lte("due_date", soon.toISOString().slice(0, 10))
      .order("due_date");

    const today = new Date(new Date().toDateString());
    for (const t of (dueTasks ?? []) as { id: string; title: string; due_date: string }[]) {
      const overdue = new Date(t.due_date + "T00:00:00") < today;
      items.push({
        id: `task-${t.id}`,
        type: "task",
        title: t.title,
        subtitle: overdue ? "Süresi geçti" : `Son tarih: ${new Date(t.due_date).toLocaleDateString("tr-TR")}`,
        href: "/panel/ogrenci/gorevler",
        date: t.due_date,
      });
    }
  }

  return items.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);
}
