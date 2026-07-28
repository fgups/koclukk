-- Albatros Koçluk — öğrenci ders bazlı net hedefleri
-- 0004_deneme_gorev_bildirim.sql'den SONRA, Supabase SQL Editor'de çalıştırın.

create table student_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  subject_id uuid not null references subjects (id) on delete cascade,
  target_net numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, subject_id)
);

create index student_goals_student_idx on student_goals (student_id);

alter table student_goals enable row level security;

create policy student_goals_select on student_goals for select to authenticated
  using (student_id = auth.uid() or is_admin(auth.uid()) or is_coach_of(auth.uid(), student_id));

create policy student_goals_insert on student_goals for insert to authenticated
  with check (student_id = auth.uid());

create policy student_goals_update on student_goals for update to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy student_goals_delete on student_goals for delete to authenticated
  using (student_id = auth.uid());
