-- Trigger kurulmadan önce oluşturulmuş auth kullanıcıları için eksik profiles
-- satırlarını geriye dönük oluşturur. Tek seferlik çalıştırılması yeterlidir.
insert into profiles (id, full_name, role, track)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  'student',
  nullif(u.raw_user_meta_data ->> 'track', '')::track
from auth.users u
left join profiles p on p.id = u.id
where p.id is null;
