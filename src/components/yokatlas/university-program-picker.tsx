"use client";

import { useEffect, useState } from "react";
import { SearchableSelect, type SelectOption } from "./searchable-select";

export interface TargetSelection {
  universiteId: number;
  universiteAdi: string;
  birimGrupId: number;
  birimGrupAdi: string;
}

export function UniversityProgramPicker({
  initial,
  onSelect,
  hiddenFieldNames,
}: {
  initial?: TargetSelection | null;
  onSelect?: (selection: TargetSelection | null) => void;
  hiddenFieldNames?: {
    universiteId: string;
    universiteAdi: string;
    birimGrupId: string;
    birimGrupAdi: string;
  };
}) {
  const [universities, setUniversities] = useState<SelectOption[]>([]);
  const [programs, setPrograms] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [university, setUniversity] = useState<SelectOption | null>(
    initial ? { id: initial.universiteId, label: initial.universiteAdi } : null,
  );
  const [program, setProgram] = useState<SelectOption | null>(
    initial ? { id: initial.birimGrupId, label: initial.birimGrupAdi } : null,
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/yokatlas/universities").then((r) => r.json()),
      fetch("/api/yokatlas/programs").then((r) => r.json()),
    ])
      .then(([unis, progs]) => {
        setUniversities((unis as { id: number; name: string }[]).map((u) => ({ id: u.id, label: u.name })));
        setPrograms(
          (progs as { id: number; name: string; puanTuru: string }[]).map((p) => ({
            id: p.id,
            label: p.name,
            sublabel: p.puanTuru,
          })),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (university && program) {
      onSelect?.({
        universiteId: university.id,
        universiteAdi: university.label,
        birimGrupId: program.id,
        birimGrupAdi: program.label,
      });
    } else {
      onSelect?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [university, program]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <SearchableSelect
          options={universities}
          value={university}
          onChange={setUniversity}
          placeholder={loading ? "Yükleniyor..." : "Üniversite seç"}
          disabled={loading}
        />
        {hiddenFieldNames && (
          <>
            <input type="hidden" name={hiddenFieldNames.universiteId} value={university?.id ?? ""} />
            <input type="hidden" name={hiddenFieldNames.universiteAdi} value={university?.label ?? ""} />
          </>
        )}
      </div>
      <div>
        <SearchableSelect
          options={programs}
          value={program}
          onChange={setProgram}
          placeholder={loading ? "Yükleniyor..." : "Bölüm seç"}
          disabled={loading}
        />
        {hiddenFieldNames && (
          <>
            <input type="hidden" name={hiddenFieldNames.birimGrupId} value={program?.id ?? ""} />
            <input type="hidden" name={hiddenFieldNames.birimGrupAdi} value={program?.label ?? ""} />
          </>
        )}
      </div>
    </div>
  );
}
