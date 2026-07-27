"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function TaskToggle({ taskId, initialDone }: { taskId: string; initialDone: boolean }) {
  const [done, setDone] = useState(initialDone);
  const [pending, setPending] = useState(false);
  const supabase = createClient();

  async function toggle() {
    const next = !done;
    setPending(true);
    setDone(next);
    const { error } = await supabase.rpc("toggle_task_done", { p_task_id: taskId, p_done: next });
    setPending(false);
    if (error) {
      setDone(!next);
    }
  }

  return (
    <input
      type="checkbox"
      checked={done}
      disabled={pending}
      onChange={toggle}
      className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
    />
  );
}
