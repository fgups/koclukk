import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { RiskAssessment } from "@/lib/risk";

const RISK_CONFIG = {
  kritik: {
    label: "Kritik",
    className: "bg-red-50 text-red-700 ring-red-200",
    Icon: AlertTriangle,
  },
  dikkat: {
    label: "Dikkat",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    Icon: AlertCircle,
  },
  iyi: {
    label: "İyi",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Icon: CheckCircle2,
  },
} as const;

export function RiskBadge({ risk }: { risk: RiskAssessment }) {
  const { label, className, Icon } = RISK_CONFIG[risk.level];
  return (
    <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium ring-1 ring-inset ${className}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="font-semibold">{label}</span>
      <span>· {risk.reason}</span>
    </div>
  );
}
