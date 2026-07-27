-- Metropol Koçluk — deneme sınavı takibi, görev atama, okunmamış mesaj bildirimi, YKS geri sayımı
-- 0003_student_view_coach_profile.sql'den SONRA, Supabase SQL Editor'de çalıştırın.

-- ---------- Deneme sınavları ----------
create table mock_exams (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  exam_name text not null,
  exam_type exam_type not null,
  exam_date date not null default current_date,
  subject_nets jsonb not null default '[]'::jsonb,
  total_net numeric not null default 0,
  created_at timestamptz not null default now()
);

create index mock_exams_student_idx on mock_exams (student_id, exam_date);

alter table mock_exams enable row level security;

create policy mock_exams_select on mock_exams for select to authenticated
  using (student_id = auth.uid() or is_admin(auth.uid()) or is_coach_of(auth.uid(), student_id));

create policy mock_exams_insert on mock_exams for insert to authenticated
  with check (student_id = auth.uid());

create policy mock_exams_update on mock_exams for update to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy mock_exams_delete on mock_exams for delete to authenticated
  using (student_id = auth.uid());

-- ---------- Görevler (koçtan öğrenciye) ----------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references profiles (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  is_done boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index tasks_student_idx on tasks (student_id, created_at);

alter table tasks enable row level security;

create policy tasks_select on tasks for select to authenticated
  using (coach_id = auth.uid() or student_id = auth.uid() or is_admin(auth.uid()));

create policy tasks_insert on tasks for insert to authenticated
  with check (coach_id = auth.uid() and is_coach_of(auth.uid(), student_id));

create policy tasks_update_coach on tasks for update to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

create policy tasks_delete_coach on tasks for delete to authenticated
  using (coach_id = auth.uid());

-- Öğrenci başlık/açıklamayı değiştiremez, sadece tamamlandı durumunu bu fonksiyonla değiştirebilir.
create function toggle_task_done(p_task_id uuid, p_done boolean)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update tasks
  set is_done = p_done, completed_at = case when p_done then now() else null end
  where id = p_task_id
    and (student_id = auth.uid() or coach_id = auth.uid());
end;
$$;

-- ---------- Mesajlarda okunma durumu ----------
alter table messages add column if not exists read_at timestamptz;

create function mark_thread_read(p_coach_id uuid, p_student_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() not in (p_coach_id, p_student_id) then
    raise exception 'bu sohbetin tarafı değilsiniz';
  end if;
  update messages
  set read_at = now()
  where coach_id = p_coach_id
    and student_id = p_student_id
    and sender_id != auth.uid()
    and read_at is null;
end;
$$;

-- ---------- Uygulama ayarları (ör. YKS sınav tarihi) ----------
create table app_settings (
  key text primary key,
  value jsonb not null
);

alter table app_settings enable row level security;

create policy app_settings_select on app_settings for select to authenticated using (true);

create function admin_set_setting(p_key text, p_value jsonb)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not is_admin(auth.uid()) then
    raise exception 'yalnızca admin ayar değiştirebilir';
  end if;
  insert into app_settings (key, value) values (p_key, p_value)
  on conflict (key) do update set value = excluded.value;
end;
$$;
