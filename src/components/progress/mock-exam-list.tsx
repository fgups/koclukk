import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MockExam } from "@/lib/types";

export function MockExamList({ exams }: { exams: MockExam[] }) {
  if (exams.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Henüz deneme eklenmedi.</p>;
  }

  return (
    <div className="space-y-2">
      {[...exams].reverse().map((exam) => (
        <details key={exam.id} className="group rounded-lg border border-slate-200 dark:border-slate-800">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{exam.exam_name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {exam.exam_type} · {new Date(exam.exam_date).toLocaleDateString("tr-TR")}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-3">
              <Badge variant="indigo">{exam.total_net} net</Badge>
              <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform group-open:rotate-180" />
            </span>
          </summary>
          <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800 px-4 pb-3 pt-2">
            {exam.subject_nets.length === 0 ? (
              <p className="py-2 text-sm text-slate-500 dark:text-slate-400">Ders bazlı detay kaydedilmemiş.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="pb-2 pr-4 font-medium">Ders</th>
                    <th className="pb-2 pr-4 font-medium">Doğru</th>
                    <th className="pb-2 pr-4 font-medium">Yanlış</th>
                    <th className="pb-2 font-medium">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {exam.subject_nets.map((s) => (
                    <tr key={s.subject_name}>
                      <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">{s.subject_name}</td>
                      <td className="py-2 pr-4 text-emerald-700">{s.correct}</td>
                      <td className="py-2 pr-4 text-red-700">{s.wrong}</td>
                      <td className="py-2 text-slate-700 dark:text-slate-300">{s.net}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
