"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  id: number;
  label: string;
  sublabel?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  options: SelectOption[];
  value: SelectOption | null;
  onChange: (option: SelectOption | null) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [open, setOpen] = useState(false);
  const [syncedValue, setSyncedValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  // Re-sync the displayed text when the controlled `value` changes externally
  // (not from a user keystroke) — the sanctioned "adjust state during render" pattern,
  // avoiding a setState-in-effect that would otherwise cause an extra render pass.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setQuery(value?.label ?? "");
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value?.label ?? "");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    const list = q ? options.filter((o) => o.label.toLocaleLowerCase("tr-TR").includes(q)) : options;
    return list.slice(0, 50);
  }, [query, options]);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {open && !disabled && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">Sonuç yok.</li>
          ) : (
            filtered.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setQuery(o.label);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <span>{o.label}</span>
                  {o.sublabel && <span className="text-xs text-slate-400 dark:text-slate-500">{o.sublabel}</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
