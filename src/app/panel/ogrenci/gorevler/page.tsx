import { ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskToggle } from "@/components/tasks/task-toggle";
import type { Task } from "@/lib/types";

export default async function GorevlerPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("student_id", profile.id)
    .order("is_done")
    .order("due_date", { nullsFirst: false });

  const list = (tasks ?? []) as Task[];
  const isOverdue = (t: Task) => !t.is_done && t.due_date && new Date(t.due_date) < new Date(new Date().toDateString());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
            <ListChecks className="h-5 w-5" />
          </span>
          Görevlerim
        </h1>
        <p className="mt-1 text-sm text-slate-500">Koçunun sana atadığı görevler.</p>
      </div>

      <Card>
        <CardContent className="pt-5">
          {list.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz sana atanmış bir görev yok.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {list.map((task) => (
                <li key={task.id} className="flex items-start gap-3 py-3">
                  <div className="pt-0.5">
                    <TaskToggle taskId={task.id} initialDone={task.is_done} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.is_done ? "text-slate-400 line-through" : "text-slate-900"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-0.5 text-sm text-slate-500">{task.description}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-2">
                      {task.due_date && (
                        <Badge variant={isOverdue(task) ? "danger" : "neutral"}>
                          Son tarih: {new Date(task.due_date).toLocaleDateString("tr-TR")}
                        </Badge>
                      )}
                      {task.is_done && <Badge variant="success">Tamamlandı</Badge>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
