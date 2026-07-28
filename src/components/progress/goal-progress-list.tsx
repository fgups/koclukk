import type { GoalProgress } from "@/lib/types";

export function GoalProgressList({ goals }: { goals: GoalProgress[] }) {
  if (goals.length === 0) {
    return <p className="text-sm text-slate-500">Henüz hedef belirlenmedi.</p>;
  }

  return (
    <ul className="space-y-3">
      {goals.map((g) => {
        const reached = g.current_net !== null && g.current_net >= g.target_net;
        const pct =
          g.current_net !== null ? Math.max(0, Math.min(100, Math.round((g.current_net / g.target_net) * 100))) : 0;

        return (
          <li key={g.subject_id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">
                {g.subject_name} <span className="text-xs font-normal text-slate-400">({g.exam_type})</span>
              </span>
              <span className={reached ? "font-medium text-emerald-700" : "text-slate-500"}>
                {g.current_net !== null ? g.current_net : "—"} / {g.target_net} net
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${reached ? "bg-emerald-500" : "bg-indigo-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
