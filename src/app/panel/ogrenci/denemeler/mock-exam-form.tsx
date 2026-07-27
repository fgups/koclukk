"use client";

import { useMemo, useState } from "react";
import { addMockExam } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { ExamType, Subject } from "@/lib/types";

export function MockExamForm({ subjects }: { subjects: Subject[] }) {
  const [examType, setExamType] = useState<ExamType | "">("");

  const relevantSubjects = useMemo(
    () => subjects.filter((s) => s.exam_type === examType),
    [subjects, examType],
  );

  return (
    <form action={addMockExam} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="exam_name">Deneme Adı</Label>
          <Input id="exam_name" name="exam_name" placeholder="Örn. 3D Yayınları TYT Deneme 5" required />
        </div>
        <div>
          <Label htmlFor="exam_date">Tarih</Label>
          <Input
            id="exam_date"
            name="exam_date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="exam_type">Sınav Türü</Label>
        <Select
          id="exam_type"
          name="exam_type"
          value={examType}
          onChange={(e) => setExamType(e.target.value as ExamType)}
          required
        >
          <option value="" disabled>
            Tür seç
          </option>
          <option value="TYT">TYT</option>
          <option value="AYT">AYT</option>
        </Select>
      </div>

      {relevantSubjects.length > 0 && (
        <div className="space-y-2 rounded-lg bg-slate-50 p-3">
          <div className="grid grid-cols-[1fr_80px_80px] gap-2 text-xs font-medium text-slate-500">
            <span>Ders</span>
            <span>Doğru</span>
            <span>Yanlış</span>
          </div>
          {relevantSubjects.map((s) => (
            <div key={s.id} className="grid grid-cols-[1fr_80px_80px] items-center gap-2">
              <input type="hidden" name="subject_name" value={s.name} />
              <span className="text-sm text-slate-700">{s.name}</span>
              <Input name="correct" type="number" min={0} defaultValue={0} className="h-9" />
              <Input name="wrong" type="number" min={0} defaultValue={0} className="h-9" />
            </div>
          ))}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!examType}>
        Denemeyi Kaydet
      </Button>
    </form>
  );
}
