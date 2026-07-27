-- Metropol Koçluk — genişletilmiş profil alanları, avatar storage ve koç-öğrenci mesajlaşma
-- 0001_init.sql'den SONRA, Supabase SQL Editor'de çalıştırın.

-- ---------- profiles: yeni alanlar ----------
alter table profiles
  add column if not exists avatar_url text,
  add column if not exists school text,
  add column if not exists grade_level text,
  add column if not exists birth_date date,
  add column if not exists phone text,
  add column if not exists bio text;

alter table profiles
  add constraint profiles_grade_level_check
    check (grade_level is null or grade_level in ('9', '10', '11', '12', 'mezun'));

alter table profiles
  add constraint profiles_bio_length_check
    check (bio is null or char_length(bio) <= 500);

revoke update on profiles from authenticated;
grant update (full_name, track, avatar_url, school, grade_level, birth_date, phone, bio)
  on profiles to authenticated;

-- ---------- avatar fotoğrafları için Storage bucket'ı ----------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy avatars_public_read on storage.objects for select
  using (bucket_id = 'avatars');

create policy avatars_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- koç-öğrenci mesajlaşma ----------
create table messages (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references profiles (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  sender_id uuid not null references profiles (id) on delete cascade,
  body text not null check (char_length(body) <= 2000),
  created_at timestamptz not null default now()
);

create index messages_pair_idx on messages (coach_id, student_id, created_at);

alter table messages enable row level security;

create policy messages_select on messages for select to authenticated
  using (coach_id = auth.uid() or student_id = auth.uid() or is_admin(auth.uid()));

create policy messages_insert on messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and (sender_id = coach_id or sender_id = student_id)
    and exists (
      select 1 from coach_students cs
      where cs.coach_id = messages.coach_id and cs.student_id = messages.student_id
    )
  );

alter publication supabase_realtime add table messages;
