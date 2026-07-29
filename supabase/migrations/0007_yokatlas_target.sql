-- Albatros Koçluk — YÖK Atlas ile entegre gerçek hedef üniversite/bölüm
-- 0006_student_targets.sql'den SONRA, Supabase SQL Editor'de çalıştırın.
-- target_department (serbest metin) ve target_rank (manuel giriş) artık gereksiz:
-- gerçek başarı sırası/net verisi YÖK Atlas'tan canlı çekiliyor, sadece hangi
-- üniversite/bölümün hedeflendiğini saklamamız yeterli.

alter table profiles
  drop column if exists target_department,
  drop column if exists target_rank;

alter table profiles
  add column if not exists target_universite_id integer,
  add column if not exists target_universite_adi text,
  add column if not exists target_birim_grup_id integer,
  add column if not exists target_birim_grup_adi text;

revoke update on profiles from authenticated;
grant update (
  full_name, track, avatar_url, school, grade_level, birth_date, phone, bio,
  daily_question_goal, target_universite_id, target_universite_adi,
  target_birim_grup_id, target_birim_grup_adi
) on profiles to authenticated;
