export type Role = "student" | "coach" | "admin";
export type Track = "sayisal" | "esit_agirlik" | "sozel" | "dil";
export type ExamType = "TYT" | "AYT";

export const TRACK_LABELS: Record<Track, string> = {
  sayisal: "Sayısal",
  esit_agirlik: "Eşit Ağırlık",
  sozel: "Sözel",
  dil: "Dil",
};

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  track: Track | null;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  exam_type: ExamType;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  order_index: number;
}

export interface QuestionLog {
  id: string;
  student_id: string;
  topic_id: string;
  log_date: string;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  created_at: string;
}

export interface CoachNote {
  id: string;
  coach_id: string;
  student_id: string;
  note: string;
  created_at: string;
}

export interface AiRecommendation {
  id: string;
  student_id: string;
  rec_date: string;
  recommendation_text: string;
  focus_topics: { topic_name: string; subject_name: string; reason: string }[];
  created_at: string;
}

export interface TopicStat {
  topic_id: string;
  topic_name: string;
  subject_id: string;
  subject_name: string;
  exam_type: ExamType;
  correct: number;
  wrong: number;
  blank: number;
  total: number;
  accuracy: number | null;
  last_practiced: string | null;
}
