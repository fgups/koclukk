"use client";

import { useMemo, useState } from "react";
import { addQuestionLog } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

interface SubjectOption {
  id: string;
  name: string;
  exam_type: "TYT" | "AYT";
}
interface TopicOption {
  id: string;
  name: string;
  subject_id: string;
}

export function QuestionLogForm({
  subjects,
  topics,
}: {
  subjects: SubjectOption[];
  topics: TopicOption[];
}) {
  const [subjectId, setSubjectId] = useState("");

  const filteredTopics = useMemo(
    () => topics.filter((t) => t.subject_id === subjectId),
    [topics, subjectId],
  );

  return (
    <form action={addQuestionLog} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="subject">Ders</Label>
          <Select
            id="subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
          >
            <option value="" disabled>
              Ders seç
            </option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.exam_type})
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="topic_id">Konu</Label>
          <Select id="topic_id" name="topic_id" required disabled={!subjectId} defaultValue="">
            <option value="" disabled>
              Konu seç
            </option>
            {filteredTopics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="correct_count">Doğru</Label>
          <Input id="correct_count" name="correct_count" type="number" min={0} defaultValue={0} required />
        </div>
        <div>
          <Label htmlFor="wrong_count">Yanlış</Label>
          <Input id="wrong_count" name="wrong_count" type="number" min={0} defaultValue={0} required />
        </div>
        <div>
          <Label htmlFor="blank_count">Boş</Label>
          <Input id="blank_count" name="blank_count" type="number" min={0} defaultValue={0} required />
        </div>
      </div>

      <div>
        <Label htmlFor="log_date">Tarih</Label>
        <Input
          id="log_date"
          name="log_date"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Kaydı Ekle
      </Button>
    </form>
  );
}
