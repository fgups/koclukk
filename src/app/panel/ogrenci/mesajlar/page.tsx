import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageThread } from "@/components/chat/message-thread";
import type { Message, Profile } from "@/lib/types";

export default async function OgrenciMesajlarPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("coach_students")
    .select("profiles!coach_students_coach_id_fkey(*)")
    .eq("student_id", profile.id);

  const coaches = ((assignments ?? []) as unknown as { profiles: Profile | null }[])
    .map((a) => a.profiles)
    .filter((c): c is Profile => c !== null);

  if (coaches.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">Mesajlar</h1>
        <Card>
          <CardContent className="pt-5 text-sm text-slate-500">
            Henüz bir koça atanmadın. Atandığında koçunla buradan yazışabileceksin.
          </CardContent>
        </Card>
      </div>
    );
  }

  const threads = await Promise.all(
    coaches.map(async (coach) => {
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("coach_id", coach.id)
        .eq("student_id", profile.id)
        .order("created_at");
      return { coach, messages: (messages ?? []) as Message[] };
    }),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Mesajlar</h1>
      {threads.map(({ coach, messages }) => (
        <Card key={coach.id}>
          <CardHeader>
            <CardTitle>{coach.full_name || "Koçun"}</CardTitle>
          </CardHeader>
          <CardContent>
            <MessageThread
              coachId={coach.id}
              studentId={profile.id}
              currentUserId={profile.id}
              initialMessages={messages}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
