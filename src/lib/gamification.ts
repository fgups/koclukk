export interface Badge {
  id: string;
  label: string;
  description: string;
  tier: "bronze" | "silver" | "gold";
  earned: boolean;
}

const BADGE_THRESHOLDS = {
  streakBronze: 10,
  totalSolvedSilver: 10000,
  streakGold: 30,
};

export function computeLongestStreak(logDates: string[]): number {
  const uniqueDates = [...new Set(logDates)].sort();
  if (uniqueDates.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1] + "T00:00:00");
    const cur = new Date(uniqueDates[i] + "T00:00:00");
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return longest;
}

export function computeCurrentStreak(logDates: string[]): number {
  const uniqueDates = [...new Set(logDates)].sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const today = new Date(new Date().toDateString());
  const mostRecent = new Date(uniqueDates[0] + "T00:00:00");
  const gapFromToday = Math.round((today.getTime() - mostRecent.getTime()) / 86400000);
  if (gapFromToday > 1) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1] + "T00:00:00");
    const cur = new Date(uniqueDates[i] + "T00:00:00");
    const diff = Math.round((prev.getTime() - cur.getTime()) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export function getBadges(totalSolved: number, longestStreak: number): Badge[] {
  return [
    {
      id: "streak-bronze",
      label: "Bronz Rozet",
      description: `${BADGE_THRESHOLDS.streakBronze} gün üst üste çalış`,
      tier: "bronze",
      earned: longestStreak >= BADGE_THRESHOLDS.streakBronze,
    },
    {
      id: "solved-silver",
      label: "Gümüş Rozet",
      description: `${BADGE_THRESHOLDS.totalSolvedSilver.toLocaleString("tr-TR")} soru çöz`,
      tier: "silver",
      earned: totalSolved >= BADGE_THRESHOLDS.totalSolvedSilver,
    },
    {
      id: "streak-gold",
      label: "Altın Rozet",
      description: `${BADGE_THRESHOLDS.streakGold} gün üst üste çalış`,
      tier: "gold",
      earned: longestStreak >= BADGE_THRESHOLDS.streakGold,
    },
  ];
}
