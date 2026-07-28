import { Award } from "lucide-react";
import type { Badge as BadgeType } from "@/lib/gamification";

const TIER_STYLES: Record<BadgeType["tier"], string> = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-slate-400 to-slate-600",
  gold: "from-yellow-400 to-amber-500",
};

export function BadgeList({ badges }: { badges: BadgeType[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`flex flex-col items-center rounded-xl border p-3 text-center ${
            badge.earned ? "border-slate-200 bg-white shadow-sm" : "border-dashed border-slate-200 bg-slate-50"
          }`}
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-white ${
              badge.earned ? TIER_STYLES[badge.tier] : "from-slate-300 to-slate-400 opacity-60"
            }`}
          >
            <Award className="h-5 w-5" />
          </span>
          <p className={`mt-2 text-xs font-semibold ${badge.earned ? "text-slate-900" : "text-slate-400"}`}>
            {badge.label}
          </p>
          <p className="mt-0.5 text-[11px] leading-tight text-slate-400">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}
