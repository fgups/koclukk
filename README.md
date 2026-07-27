# Metropol Koçluk

YKS'ye hazırlanan öğrenciler için soru takibi, ilerleme paneli, koç takip ekranı ve yapay zeka
destekli günlük çalışma önerileri sunan platform.

## Kurulum

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Supabase projesi oluştur

1. [supabase.com](https://supabase.com) üzerinden ücretsiz bir hesap aç ve yeni bir proje oluştur.
2. Proje panelinde **Project Settings → API** bölümünden `Project URL` ve `anon public` key'i al.
3. **SQL Editor**'e girip sırasıyla şu dosyaların içeriğini çalıştır:
   - `supabase/migrations/0001_init.sql` (şema + RLS politikaları)
   - `supabase/seed.sql` (TYT/AYT ders ve konu listesi)

### 3. Ortam değişkenleri

`.env.local.example` dosyasını `.env.local` olarak kopyala ve doldur:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

AI öneri motoru dışarıya API çağrısı yapmaz; öğrencinin verilerinden kural tabanlı olarak
otomatik metin üretir, bu yüzden ek bir API anahtarı gerekmez.

### 4. Geliştirme sunucusu

```bash
npm run dev
```

### 5. İlk yönetici (admin) hesabını oluşturma

Roller varsayılan olarak `student`'tır; ilk admin'i elle atamak gerekir:

1. Siteye kayıt ol (`/kayit`).
2. Supabase SQL Editor'de:
   ```sql
   update profiles set role = 'admin' where id = (
     select id from auth.users where email = 'senin-mailin@ornek.com'
   );
   ```
3. Artık `/panel/admin` üzerinden diğer kullanıcıları koç yapabilir, koç-öğrenci ataması
   yapabilirsin.

## Proje yapısı

- `src/app` — sayfalar ve server action'lar (App Router)
- `src/lib/supabase` — tarayıcı/sunucu Supabase client'ları ve middleware
- `src/lib/ai/recommend.ts` — kural tabanlı önceliklendirme ve öneri metni üretimi (ücretsiz, API gerektirmez)
- `supabase/migrations` — veritabanı şeması ve RLS politikaları
- `supabase/seed.sql` — TYT/AYT ders ve konu seed verisi

## Roller

- **student**: kendi soru kayıtlarını girer, ilerlemesini ve AI önerilerini görür.
- **coach**: kendisine atanan öğrencileri izler, not bırakır.
- **admin**: rolleri değiştirir, koç-öğrenci atamalarını yönetir, tüm öğrencileri görür.
