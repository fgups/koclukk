export type RiskLevel = "kritik" | "dikkat" | "iyi";

export interface RiskAssessment {
  level: RiskLevel;
  reason: string;
}

const CRITICAL_INACTIVITY_DAYS = 7;
const WARNING_INACTIVITY_DAYS = 3;

/** Ders çalışma düzenliliğine ve net gelişimine göre öğrenci risk seviyesini belirler. */
export function assessRisk(inactiveDays: number | null, netTrend: number | null): RiskAssessment {
  if (inactiveDays === null) {
    return { level: "kritik", reason: "Hiç soru kaydı yok" };
  }
  if (inactiveDays >= CRITICAL_INACTIVITY_DAYS) {
    return { level: "kritik", reason: `${inactiveDays} gündür çalışmıyor` };
  }
  if (inactiveDays >= WARNING_INACTIVITY_DAYS) {
    return { level: "dikkat", reason: `${inactiveDays} gündür çalışmıyor` };
  }
  if (netTrend !== null && netTrend < 0) {
    return { level: "dikkat", reason: "Son denemede net düştü" };
  }
  return { level: "iyi", reason: "Düzenli çalışıyor" };
}
