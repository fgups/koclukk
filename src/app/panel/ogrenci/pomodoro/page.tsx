import { Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer";

export default function PomodoroPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm">
            <Timer className="h-5 w-5" />
          </span>
          Pomodoro
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          25 dakika odaklan, 5 dakika mola ver. Çalışmana ritim kat.
        </p>
      </div>

      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Zamanlayıcı</CardTitle>
          <CardDescription>Süre bitince mod otomatik değişir, devam etmek için tekrar başlat.</CardDescription>
        </CardHeader>
        <CardContent>
          <PomodoroTimer />
        </CardContent>
      </Card>
    </div>
  );
}
