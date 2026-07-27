-- Metropol Koçluk — öğrencinin, kendisine atanmış koçun profilini görebilmesi
-- (mesajlar sayfasında koç adının gösterilebilmesi için gerekli).
-- 0002_profiles_messages.sql'den SONRA, Supabase SQL Editor'de çalıştırın.

drop policy if exists profiles_select on profiles;

create policy profiles_select on profiles for select to authenticated
  using (
    id = auth.uid()
    or is_admin(auth.uid())
    or is_coach_of(auth.uid(), id)
    or is_coach_of(id, auth.uid())
  );
