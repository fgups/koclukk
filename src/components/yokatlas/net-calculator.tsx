"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { UniversityProgramPicker, type TargetSelection } from "./university-program-picker";
import { NetHistoryCard } from "./net-history-card";
import type { NetHistoryRow, ProgramResult } from "@/lib/yokatlas";

interface Result {
  current: ProgramResult | null;
  netHistory: NetHistoryRow[];
}

export function NetCalculator() {
  const [selection, setSelection] = useState<TargetSelection | null>(null);
  const [diplomaNotu, setDiplomaNotu] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate() {
    if (!selection) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/yokatlas/net-history?universiteId=${selection.universiteId}&birimGrupId=${selection.birimGrupId}`,
      );
      if (!res.ok) throw new Error("İstek başarısız");
      const data = (await res.json()) as Result;
      setResult(data);
    } catch {
      setError("Veri alınamadı, birkaç saniye sonra tekrar dene.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <UniversityProgramPicker onSelect={setSelection} />

      <div className="max-w-xs">
        <label htmlFor="diploma-notu" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Diploma Notun (opsiyonel, 100 üzerinden)
        </label>
        <input
          id="diploma-notu"
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={diplomaNotu}
          onChange={(e) => setDiplomaNotu(e.target.value)}
          placeholder="Örn. 85.40"
          className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Girersen, diploma notunun (OBP formülü: not × 5) bu bölüme sağladığı puan katkısını son yerleşen adayla
          karşılaştırırız.
        </p>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        disabled={!selection || loading}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        Yaklaşık Neti Hesapla
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {result && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <NetHistoryCard
            current={result.current}
            netHistory={result.netHistory}
            userDiplomaNotu={diplomaNotu ? Number(diplomaNotu) : null}
          />
        </div>
      )}
    </div>
  );
}
