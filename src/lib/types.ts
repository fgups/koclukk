export type Role = "student" | "coach" | "admin";
export type Track = "sayisal" | "esit_agirlik" | "sozel" | "dil";
export type ExamType = "TYT" | "AYT";
export type GradeLevel = "9" | "10" | "11" | "12" | "mezun";

export const TRACK_LABELS: Record<Track, string> = {
  sayisal: "Sayısal",
  esit_agirlik: "Eşit Ağırlık",
  sozel: "Sözel",
  dil: "Dil",
};

export const GRADE_LEVEL_LABELS: Record<GradeLevel, string> = {
  "9": "9. Sınıf",
  "10": "10. Sınıf",
  "11": "11. Sınıf",
  "12": "12. Sınıf",
  mezun: "Mezun",
};

// AYT'de öğrencinin alanına göre hangi derslerin onu ilgilendirdiği (basitleştirilmiş eşleme).
export const TRACK_AYT_SUBJECTS: Record<Track, string[]> = {
  sayisal: ["Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji"],
  esit_agirlik: ["Matematik", "Geometri", "Edebiyat", "Tarih", "Coğrafya"],
  sozel: ["Edebiyat", "Tarih", "Coğrafya"],
  dil: [],
};

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  track: Track | null;
  created_at: string;
  avatar_url: string | null;
  school: string | null;
  grade_level: GradeLevel | null;
  birth_date: string | null;
  phone: string | null;
  bio: string | null;
  target_department: string | null;
  target_rank: number | null;
  daily_question_goal: number | null;
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

export interface Message {
  id: string;
  coach_id: string;
  student_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface SubjectNet {
  subject_name: string;
  correct: number;
  wrong: number;
  net: number;
}

export interface MockExam {
  id: string;
  student_id: string;
  exam_name: string;
  exam_type: ExamType;
  exam_date: string;
  subject_nets: SubjectNet[];
  total_net: number;
  created_at: string;
}

export interface Task {
  id: string;
  coach_id: string;
  student_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_done: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface StudentGoal {
  id: string;
  student_id: string;
  subject_id: string;
  target_net: number;
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  subject_id: string;
  subject_name: string;
  exam_type: ExamType;
  target_net: number;
  current_net: number | null;
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
