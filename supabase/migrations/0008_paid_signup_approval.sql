-- Albatros Koçluk — ücretli üyelik: yeni kayıtlar admin onayı bekler
-- 0007_yokatlas_target.sql'den SONRA, Supabase SQL Editor'de çalıştırın.

-- Mevcut hesaplar etkilenmesin diye kolon varsayılanı true; yeni kayıtlar
-- handle_new_user() tarafından açıkça false olarak oluşturulacak.
alter table profiles
  add column if not exists approved boolean not null default true;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, track, approved)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'track', '')::track,
    false
  );
  return new;
end;
$$;

create function admin_approve_student(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not is_admin(auth.uid()) then
    raise exception 'yalnızca admin onaylayabilir';
  end if;
  update profiles set approved = true where id = p_user_id;
end;
$$;
