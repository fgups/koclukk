"use client";

import { useEffect, useState } from "react";
import { SearchableSelect, type SelectOption } from "./searchable-select";

export function EntityPicker({
  kind,
  hiddenFieldName,
  initialId,
  initialLabel,
  placeholder,
}: {
  kind: "universities" | "programs" | "cities";
  hiddenFieldName: string;
  initialId?: number;
  initialLabel?: string;
  placeholder: string;
}) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SelectOption | null>(
    initialId && initialLabel ? { id: initialId, label: initialLabel } : null,
  );

  useEffect(() => {
    fetch(`/api/yokatlas/${kind}`)
      .then((r) => r.json())
      .then((data: { id: number; name: string; puanTuru?: string }[]) => {
        setOptions(data.map((d) => ({ id: d.id, label: d.name, sublabel: d.puanTuru })));
      })
      .finally(() => setLoading(false));
  }, [kind]);

  return (
    <div>
      <SearchableSelect
        options={options}
        value={selected}
        onChange={setSelected}
        placeholder={loading ? "Yükleniyor..." : placeholder}
        disabled={loading}
      />
      <input type="hidden" name={hiddenFieldName} value={selected?.id ?? ""} />
    </div>
  );
}
