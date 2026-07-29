import type { NetHistoryRow, ProgramResult } from "@/lib/yokatlas";
import { sumNet, TYT_NET_FIELDS, AYT_NET_FIELDS } from "@/lib/yokatlas";

export function NetHistoryCard({
  current,
  netHistory,
  userDiplomaNotu = null,
}: {
  current: ProgramResult | null;
  netHistory: NetHistoryRow[];
  /** 100 üzerinden diploma notu — ÖSYM'nin resmi "OBP = diploma notu × 5" formülüyle iç hesaplamada ölçeklenir. */
  userDiplomaNotu?: number | null;
}) {
  if (!current && netHistory.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Bu üniversite/bölüm kombinasyonu için YÖK Atlas&apos;ta veri bulunamadı.
      </p>
    );
  }

  const latest = netHistory[0];
  const hasObpData =
    userDiplomaNotu !== null && !Number.isNaN(userDiplomaNotu) && latest?.katsayi !== null && latest?.obp !== null;
  // YÖK Atlas'ın döndürdüğü `obp` alanı zaten ×5 ölçekli (AOBP); öğrencinin girdiği
  // 100'lük diploma notunu aynı ölçeğe getirip öyle karşılaştırıyoruz.
  const userObpScaled = hasObpData ? userDiplomaNotu! * 5 : null;
  const userContribution = hasObpData ? Math.round(userObpScaled! * latest.katsayi! * 100) / 100 : null;
  const lastAdmittedContribution = hasObpData ? Math.round(latest.obp! * latest.katsayi! * 100) / 100 : null;
  const obpDiff =
    userContribution !== null && lastAdmittedContribution !== null
      ? Math.round((userContribution - lastAdmittedContribution) * 100) / 100
      : null;

  return (
    <div className="space-y-4">
      {current && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">{current.yil} Başarı Sırası</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {current.basariSirasi?.toLocaleString("tr-TR") ?? "—"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Taban Puan</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {current.minPuan?.toFixed(2) ?? "—"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Kontenjan</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{current.kontenjan}</p>
          </div>
        </div>
      )}

      {latest && (
        <div>
          <p className="mb-1.5 text-xs text-slate-500 dark:text-slate-400">
            YÖK Atlas {latest.yil} verisine göre <strong>son yerleşen adayın yaklaşık netleri</strong>:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/30">
              <p className="text-xs text-indigo-600 dark:text-indigo-300">TYT Net (yaklaşık)</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-200">
                {sumNet(latest, TYT_NET_FIELDS) ?? "—"}
              </p>
            </div>
            <div className="rounded-lg bg-fuchsia-50 p-3 dark:bg-fuchsia-900/30">
              <p className="text-xs text-fuchsia-600 dark:text-fuchsia-300">AYT/YDT Net (yaklaşık)</p>
              <p className="text-2xl font-bold text-fuchsia-700 dark:text-fuchsia-200">
                {sumNet(latest, AYT_NET_FIELDS) ?? "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {hasObpData && obpDiff !== null && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
          <p className="text-sm text-amber-900 dark:text-amber-200">
            Diploma notun ({userDiplomaNotu}) bu bölüme <strong>+{userContribution}</strong> puan katkı sağlıyor. Son
            yerleşen adayın diploma katkısı <strong>+{lastAdmittedContribution}</strong> puandı (fark:{" "}
            <strong>
              {obpDiff >= 0 ? "+" : ""}
              {obpDiff}
            </strong>{" "}
            puan).{" "}
            {obpDiff >= 0
              ? "Diploma notun avantajlı — TYT/AYT puanının son yerleşenden biraz daha düşük olması yeterli olabilir."
              : "Diploma notun dezavantajlı — bu farkı TYT/AYT puanınla kapatman gerekiyor."}
          </p>
        </div>
      )}

      {netHistory.length > 1 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="pb-2 pr-4 font-medium">Yıl</th>
                <th className="pb-2 pr-4 font-medium">TYT Net</th>
                <th className="pb-2 pr-4 font-medium">AYT/YDT Net</th>
                <th className="pb-2 font-medium">Taban Puan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {netHistory.map((row) => (
                <tr key={row.yil}>
                  <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">{row.yil}</td>
                  <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">{sumNet(row, TYT_NET_FIELDS) ?? "—"}</td>
                  <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">{sumNet(row, AYT_NET_FIELDS) ?? "—"}</td>
                  <td className="py-2 text-slate-700 dark:text-slate-300">{row.tabanPuan?.toFixed(2) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Kaynak: YÖK Atlas. Bu rakamlar son yerleşen adayın gerçek netleridir; her yıl değişebileceğinden{" "}
        <strong>yaklaşık</strong> hedef olarak değerlendirin.
      </p>
    </div>
  );
}
