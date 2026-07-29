const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function levelFor(count: number): number {
  if (count === 0) return 0;
  if (count < 10) return 1;
  if (count < 30) return 2;
  if (count < 60) return 3;
  return 4;
}

const LEVEL_CLASSES = [
  "bg-slate-100 dark:bg-slate-800",
  "bg-emerald-200",
  "bg-emerald-400",
  "bg-emerald-600",
  "bg-emerald-800",
];

export function StudyHeatmap({ data, weeks = 14 }: { data: Record<string, number>; weeks?: number }) {
  const today = new Date(new Date().toDateString());
  const todayDow = today.getDay() === 0 ? 7 : today.getDay(); // 1 = Mon ... 7 = Sun
  const daysBackToMonday = todayDow - 1;
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - daysBackToMonday - (weeks - 1) * 7);

  const columns: { date: string; count: number }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: { date: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      const key = date.toISOString().slice(0, 10);
      col.push({ date: key, count: data[key] ?? 0 });
    }
    columns.push(col);
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <div className="flex flex-col gap-1 pt-0 text-[10px] text-slate-400 dark:text-slate-500">
          {DAY_LABELS.map((d) => (
            <span key={d} className="flex h-3.5 items-center">
              {d}
            </span>
          ))}
        </div>
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-1">
            {col.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.count} soru`}
                className={`h-3.5 w-3.5 rounded-sm ${LEVEL_CLASSES[levelFor(cell.count)]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
        <span>Az</span>
        {LEVEL_CLASSES.map((c, i) => (
          <span key={i} className={`h-3 w-3 rounded-sm ${c}`} />
        ))}
        <span>Çok</span>
      </div>
    </div>
  );
}
