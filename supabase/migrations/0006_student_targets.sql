-- Albatros Koçluk — öğrenci hedef bölüm/sıralama ve günlük soru hedefi
-- 0005_student_goals.sql'den SONRA, Supabase SQL Editor'de çalıştırın.

alter table profiles
  add column if not exists target_department text,
  add column if not exists target_rank integer,
  add column if not exists daily_question_goal integer;

alter table profiles
  add constraint profiles_target_rank_check check (target_rank is null or target_rank > 0);

alter table profiles
  add constraint profiles_daily_question_goal_check
    check (daily_question_goal is null or daily_question_goal > 0);

revoke update on profiles from authenticated;
grant update (
  full_name, track, avatar_url, school, grade_level, birth_date, phone, bio,
  target_department, target_rank, daily_question_goal
) on profiles to authenticated;
