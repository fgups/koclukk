-- Albatros Koçluk — admin kullanıcı e-postalarını görsün (şifre sıfırlama maili göndermek için)
-- 0008_paid_signup_approval.sql'den SONRA, Supabase SQL Editor'de çalıştırın.
-- E-posta profiles tablosuna eklenmiyor (RLS ile herkese açılma riskini önlemek için);
-- sadece admin'in çağırabildiği bu fonksiyon üzerinden auth.users'tan okunuyor.

create function admin_list_user_emails()
returns table (id uuid, email text)
language plpgsql
security definer set search_path = public
as $$
begin
  if not is_admin(auth.uid()) then
    raise exception 'yalnızca admin görüntüleyebilir';
  end if;
  return query select p.id, u.email::text from profiles p join auth.users u on u.id = p.id;
end;
$$;
