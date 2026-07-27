-- Metropol Koçluk — ilk şema, RLS politikaları ve tetikleyiciler
-- Bu dosyayı Supabase projenizin SQL Editor'ünde tek seferde çalıştırın.

create extension if not exists "pgcrypto";

-- ---------- Tipler ----------
create type user_role as enum ('student', 'coach', 'admin');
create type track as enum ('sayisal', 'esit_agirlik', 'sozel', 'dil');
create type exam_type as enum ('TYT', 'AYT');

-- ---------- Tablolar ----------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role user_role not null default 'student',
  track track,
  created_at timestamptz not null default now()
);

create table coach_students (
  coach_id uuid not null references profiles (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (coach_id, student_id)
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  exam_type exam_type not null
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects (id) on delete cascade,
  name text not null,
  order_index int not null default 0
);

create table question_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  topic_id uuid not null references topics (id) on delete cascade,
  log_date date not null default current_date,
  correct_count int not null default 0 check (correct_count >= 0),
  wrong_count int not null default 0 check (wrong_count >= 0),
  blank_count int not null default 0 check (blank_count >= 0),
  created_at timestamptz not null default now()
);

create table coach_notes (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references profiles (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  rec_date date not null default current_date,
  recommendation_text text not null,
  focus_topics jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index question_logs_student_idx on question_logs (student_id, log_date desc);
create index coach_notes_student_idx on coach_notes (student_id);
create index ai_recommendations_student_idx on ai_recommendations (student_id, rec_date desc);
create index topics_subject_idx on topics (subject_id, order_index);

-- ---------- auth.users -> profiles senkronu ----------
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, track)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'track', '')::track
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- Yardımcı fonksiyon: rol kontrolü ----------
create function is_admin(uid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from profiles where id = uid and role = 'admin');
$$;

create function is_coach_of(uid uuid, target_student uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from coach_students
    where coach_id = uid and student_id = target_student
  );
$$;

-- ---------- Admin'e özel rol/atama işlemleri (RLS'i güvenle bypass eder) ----------
create function admin_set_role(target_user uuid, new_role user_role)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not is_admin(auth.uid()) then
    raise exception 'yalnızca admin rol değiştirebilir';
  end if;
  update profiles set role = new_role where id = target_user;
end;
$$;

create function admin_assign_student(p_coach_id uuid, p_student_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not is_admin(auth.uid()) then
    raise exception 'yalnızca admin atama yapabilir';
  end if;
  insert into coach_students (coach_id, student_id) values (p_coach_id, p_student_id)
  on conflict do nothing;
end;
$$;

create function admin_unassign_student(p_coach_id uuid, p_student_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not is_admin(auth.uid()) then
    raise exception 'yalnızca admin atamayı kaldırabilir';
  end if;
  delete from coach_students where coach_id = p_coach_id and student_id = p_student_id;
end;
$$;

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table coach_students enable row level security;
alter table subjects enable row level security;
alter table topics enable row level security;
alter table question_logs enable row level security;
alter table coach_notes enable row level security;
alter table ai_recommendations enable row level security;

-- profiles
create policy profiles_select on profiles for select to authenticated
  using (
    id = auth.uid()
    or is_admin(auth.uid())
    or is_coach_of(auth.uid(), id)
  );

create policy profiles_update_own on profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

revoke update on profiles from authenticated;
grant update (full_name, track) on profiles to authenticated;

-- coach_students
create policy coach_students_select on coach_students for select to authenticated
  using (coach_id = auth.uid() or student_id = auth.uid() or is_admin(auth.uid()));

-- inserts/deletes go through admin_assign_student / admin_unassign_student (security definer)

-- subjects & topics: herkes (giriş yapmış) okuyabilir
create policy subjects_select on subjects for select to authenticated using (true);
create policy topics_select on topics for select to authenticated using (true);

-- question_logs
create policy question_logs_select on question_logs for select to authenticated
  using (
    student_id = auth.uid()
    or is_admin(auth.uid())
    or is_coach_of(auth.uid(), student_id)
  );

create policy question_logs_insert on question_logs for insert to authenticated
  with check (student_id = auth.uid());

create policy question_logs_update on question_logs for update to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy question_logs_delete on question_logs for delete to authenticated
  using (student_id = auth.uid());

-- coach_notes (öğrenci kendi hakkındaki notları görmez; sadece koç ve admin)
create policy coach_notes_select on coach_notes for select to authenticated
  using (coach_id = auth.uid() or is_admin(auth.uid()));

create policy coach_notes_insert on coach_notes for insert to authenticated
  with check (
    coach_id = auth.uid()
    and (is_coach_of(auth.uid(), student_id) or is_admin(auth.uid()))
  );

-- ai_recommendations
create policy ai_recommendations_select on ai_recommendations for select to authenticated
  using (
    student_id = auth.uid()
    or is_admin(auth.uid())
    or is_coach_of(auth.uid(), student_id)
  );

create policy ai_recommendations_insert on ai_recommendations for insert to authenticated
  with check (student_id = auth.uid());
