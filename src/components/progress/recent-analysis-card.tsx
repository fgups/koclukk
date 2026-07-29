import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RecentAnalysis } from "@/lib/stats";

const TREND_CONFIG = {
  up: { label: "Yükseliyor", Icon: TrendingUp, className: "text-emerald-600 dark:text-emerald-400" },
  down: { label: "Düşüyor", Icon: TrendingDown, className: "text-red-600 dark:text-red-400" },
  flat: { label: "Sabit", Icon: Minus, className: "text-slate-500 dark:text-slate-400" },
} as const;

export function RecentAnalysisCard({ analysis }: { analysis: RecentAnalysis }) {
  const trend = analysis.trend ? TREND_CONFIG[analysis.trend] : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Çözülen Soru</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{analysis.totalSolved}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Aktif Gün</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {analysis.activeDays}
            <span className="text-sm font-normal text-slate-400 dark:text-slate-500">/{analysis.windowDays}</span>
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Doğruluk Trendi</p>
          {trend ? (
            <p className={`flex items-center gap-1 text-lg font-bold ${trend.className}`}>
              <trend.Icon className="h-4 w-4" />
              {trend.label}
            </p>
          ) : (
            <p className="text-lg font-bold text-slate-400 dark:text-slate-500">—</p>
          )}
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">En Çok Çalışılan</p>
          <p className="truncate text-lg font-bold text-slate-900 dark:text-slate-100">
            {analysis.topSubject?.name ?? "—"}
          </p>
        </div>
      </div>

      {analysis.untouchedSubjects.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs text-slate-500 dark:text-slate-400">
            Son {analysis.windowDays} gündür hiç çalışılmayan dersler:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.untouchedSubjects.map((s) => (
              <Badge key={s} variant="warning">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
