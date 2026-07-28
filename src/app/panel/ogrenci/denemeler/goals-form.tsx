"use client";

import { setGoals } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExamType, Subject } from "@/lib/types";

const EXAM_TYPES: ExamType[] = ["TYT", "AYT"];

export function GoalsForm({
  subjects,
  goalsBySubject,
}: {
  subjects: Subject[];
  goalsBySubject: Record<string, number>;
}) {
  return (
    <form action={setGoals} className="space-y-4">
      {EXAM_TYPES.map((type) => {
        const list = subjects.filter((s) => s.exam_type === type);
        if (list.length === 0) return null;
        return (
          <div key={type} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{type}</p>
            <div className="space-y-2 rounded-lg bg-slate-50 p-3">
              {list.map((s) => (
                <div key={s.id} className="grid grid-cols-[1fr_100px] items-center gap-2">
                  <span className="text-sm text-slate-700">{s.name}</span>
                  <Input
                    name={`target_${s.id}`}
                    type="number"
                    min={0}
                    step="0.5"
                    defaultValue={goalsBySubject[s.id] ?? ""}
                    placeholder="Hedef net"
                    className="h-9"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <Button type="submit" className="w-full">
        Hedefleri Kaydet
      </Button>
    </form>
  );
}
