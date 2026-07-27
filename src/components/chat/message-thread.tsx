"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { Message } from "@/lib/types";

export function MessageThread({
  coachId,
  studentId,
  currentUserId,
  initialMessages,
}: {
  coachId: string;
  studentId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${coachId}-${studentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `student_id=eq.${studentId}` },
        (payload) => {
          const incoming = payload.new as Message;
          if (incoming.coach_id !== coachId) return;
          setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachId, studentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({ coach_id: coachId, student_id: studentId, sender_id: currentUserId, body: text })
      .select()
      .single();

    setSending(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setBody("");
    if (data) {
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message]));
    }
  }

  return (
    <div className="flex h-[420px] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg bg-slate-50 p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate-500">Henüz mesaj yok. İlk mesajı sen gönder.</p>
        )}
        {messages.map((m) => {
          const isMine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  isMine ? "bg-indigo-600 text-white" : "bg-white text-slate-800 shadow-sm"
                }`}
              >
                <p className="whitespace-pre-line">{m.body}</p>
                <p className={`mt-1 text-[10px] ${isMine ? "text-indigo-100" : "text-slate-400"}`}>
                  {new Date(m.created_at).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Mesajını yaz..."
          className="min-h-[44px] flex-1"
        />
        <Button type="button" onClick={handleSend} disabled={sending || !body.trim()}>
          Gönder
        </Button>
      </div>
    </div>
  );
}
