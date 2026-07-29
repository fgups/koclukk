import { LineChart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getTopicStats } from "@/lib/stats";
import { TopicProgressView } from "@/components/progress/topic-progress-view";

export default async function IlerlemePage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const stats = await getTopicStats(supabase, profile.id);

  const totalSolved = stats.reduce((sum, t) => sum + t.total, 0);
  const startedTopics = stats.filter((t) => t.total > 0).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-sm">
            <LineChart className="h-5 w-5" />
          </span>
          İlerlemem
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Toplam {totalSolved} soru çözdün, {startedTopics}/{stats.length} konuya başladın.
        </p>
      </div>

      <TopicProgressView stats={stats} chartDescription="Şimdiye kadar en az 1 soru çözdüğün dersler." />
    </div>
  );
}
