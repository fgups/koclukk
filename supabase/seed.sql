-- Metropol Koçluk — TYT / AYT ders ve konu seed verisi
-- 0001_init.sql çalıştırıldıktan SONRA, Supabase SQL Editor'de çalıştırın.

insert into subjects (name, exam_type) values
  ('Türkçe', 'TYT'),
  ('Matematik', 'TYT'),
  ('Geometri', 'TYT'),
  ('Fizik', 'TYT'),
  ('Kimya', 'TYT'),
  ('Biyoloji', 'TYT'),
  ('Tarih', 'TYT'),
  ('Coğrafya', 'TYT'),
  ('Felsefe', 'TYT'),
  ('Din Kültürü ve Ahlak Bilgisi', 'TYT'),
  ('Matematik', 'AYT'),
  ('Geometri', 'AYT'),
  ('Fizik', 'AYT'),
  ('Kimya', 'AYT'),
  ('Biyoloji', 'AYT'),
  ('Edebiyat', 'AYT'),
  ('Tarih', 'AYT'),
  ('Coğrafya', 'AYT');

-- TYT Türkçe
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Sözcükte Anlam'),(2,'Cümlede Anlam'),(3,'Paragrafta Anlam'),(4,'Ses Bilgisi'),
  (5,'Yazım Kuralları'),(6,'Noktalama İşaretleri'),(7,'Sözcükte Yapı ve Ekler'),
  (8,'Sözcük Türleri'),(9,'Cümlenin Öğeleri'),(10,'Cümle Türleri'),(11,'Anlatım Bozuklukları')
) as t(ord, name) on true
where s.name = 'Türkçe' and s.exam_type = 'TYT';

-- TYT Matematik
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Temel Kavramlar'),(2,'Sayı Basamakları'),(3,'Bölme ve Bölünebilme'),(4,'EBOB-EKOK'),
  (5,'Rasyonel Sayılar'),(6,'Basit Eşitsizlikler'),(7,'Mutlak Değer'),(8,'Üslü Sayılar'),
  (9,'Köklü Sayılar'),(10,'Çarpanlara Ayırma'),(11,'Oran Orantı'),(12,'Denklem Çözme'),
  (13,'Sayı Problemleri'),(14,'Kesir Problemleri'),(15,'Yaş Problemleri'),(16,'İşçi-Havuz Problemleri'),
  (17,'Hareket Problemleri'),(18,'Yüzde ve Kâr-Zarar Problemleri'),(19,'Karışım Problemleri'),
  (20,'Kümeler'),(21,'Fonksiyonlar'),(22,'Polinomlar'),(23,'İkinci Dereceden Denklemler'),
  (24,'Permütasyon ve Kombinasyon'),(25,'Olasılık'),(26,'Veri ve İstatistik')
) as t(ord, name) on true
where s.name = 'Matematik' and s.exam_type = 'TYT';

-- TYT Geometri
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Doğruda ve Üçgende Açılar'),(2,'Üçgende Alan ve Benzerlik'),(3,'Özel Üçgenler (Dik, İkizkenar)'),
  (4,'Çokgenler'),(5,'Dörtgenler'),(6,'Çember ve Daire'),(7,'Analitik Geometri'),(8,'Katı Cisimler')
) as t(ord, name) on true
where s.name = 'Geometri' and s.exam_type = 'TYT';

-- TYT Fizik
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Fizik Bilimine Giriş'),(2,'Madde ve Özellikleri'),(3,'Hareket ve Kuvvet'),(4,'Newton''un Hareket Yasaları'),
  (5,'Enerji ve Enerji Dönüşümleri'),(6,'Isı, Sıcaklık ve Genleşme'),(7,'Elektrostatik'),
  (8,'Elektrik Akımı ve Devreler'),(9,'Manyetizma'),(10,'Basınç ve Kaldırma Kuvveti'),
  (11,'Optik (Işık)'),(12,'Dalgalar')
) as t(ord, name) on true
where s.name = 'Fizik' and s.exam_type = 'TYT';

-- TYT Kimya
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Kimya Bilimi'),(2,'Atom ve Periyodik Sistem'),(3,'Kimyasal Türler Arası Etkileşimler'),
  (4,'Maddenin Halleri'),(5,'Kimyanın Temel Kanunları'),(6,'Mol Kavramı'),(7,'Karışımlar'),
  (8,'Asit, Baz ve Tuz'),(9,'Kimya Her Yerde')
) as t(ord, name) on true
where s.name = 'Kimya' and s.exam_type = 'TYT';

-- TYT Biyoloji
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Canlıların Ortak Özellikleri'),(2,'Canlıların Temel Bileşenleri'),(3,'Hücre ve Organeller'),
  (4,'Canlıların Sınıflandırılması'),(5,'Hücre Bölünmeleri (Mitoz-Mayoz)'),(6,'Kalıtım'),
  (7,'Ekosistem Ekolojisi')
) as t(ord, name) on true
where s.name = 'Biyoloji' and s.exam_type = 'TYT';

-- TYT Tarih
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Tarih ve Zaman'),(2,'İnsanlığın İlk Dönemleri'),(3,'Ortaçağda Dünya'),
  (4,'İlk ve Orta Çağlarda Türk Dünyası'),(5,'İslam Tarihi ve Uygarlığı'),
  (6,'Türk İslam Devletleri'),(7,'Beylikten Devlete Osmanlı'),(8,'Dünya Gücü Osmanlı'),
  (9,'Yerleşme ve Devletleşme Sürecinde Savaşçılar'),(10,'Değişim Çağı'),
  (11,'Uluslararası İlişkilerde Denge Stratejisi'),(12,'Devrimler Çağında Değişen Devlet-Toplum İlişkileri')
) as t(ord, name) on true
where s.name = 'Tarih' and s.exam_type = 'TYT';

-- TYT Coğrafya
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Doğa ve İnsan'),(2,'Dünya''nın Şekli ve Hareketleri'),(3,'Coğrafi Konum'),
  (4,'Harita Bilgisi'),(5,'İklim Bilgisi'),(6,'Yer Şekillerinin Oluşumu (İç Kuvvetler)'),
  (7,'Yer Şekillerinin Oluşumu (Dış Kuvvetler)'),(8,'Nüfus'),(9,'Yerleşme'),
  (10,'Türkiye''nin Yer Şekilleri'),(11,'Ekonomik Faaliyetler')
) as t(ord, name) on true
where s.name = 'Coğrafya' and s.exam_type = 'TYT';

-- TYT Felsefe
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Felsefeye Giriş'),(2,'Bilgi Felsefesi'),(3,'Varlık Felsefesi'),(4,'Ahlak Felsefesi'),
  (5,'Din Felsefesi'),(6,'Siyaset Felsefesi'),(7,'Sanat Felsefesi')
) as t(ord, name) on true
where s.name = 'Felsefe' and s.exam_type = 'TYT';

-- TYT Din Kültürü ve Ahlak Bilgisi
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Bilgi ve İnanç'),(2,'İbadet'),(3,'Ahlaki Tutum ve Davranışlar'),
  (4,'Hz. Muhammed''in Hayatı'),(5,'Vahiy ve Akıl'),(6,'Din ve Hayat')
) as t(ord, name) on true
where s.name = 'Din Kültürü ve Ahlak Bilgisi' and s.exam_type = 'TYT';

-- AYT Matematik
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Fonksiyonlarda İleri Konular'),(2,'Polinomlarda İleri Konular'),
  (3,'İkinci Dereceden Denklemlerde İleri Konular'),(4,'Trigonometri'),(5,'Logaritma'),
  (6,'Diziler'),(7,'Limit ve Süreklilik'),(8,'Türev'),(9,'İntegral'),(10,'Analitik Geometride İleri Konular')
) as t(ord, name) on true
where s.name = 'Matematik' and s.exam_type = 'AYT';

-- AYT Geometri
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Çokgenlerde İleri Konular'),(2,'Çemberde Analitik Yaklaşım'),(3,'Katı Cisimlerde İleri Konular'),
  (4,'Vektörler'),(5,'Uzay Geometri')
) as t(ord, name) on true
where s.name = 'Geometri' and s.exam_type = 'AYT';

-- AYT Fizik
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Kuvvet ve Hareket (İleri)'),(2,'Elektrik ve Manyetizma (İleri)'),(3,'Optik (İleri)'),
  (4,'Modern Fizik'),(5,'Çembersel Hareket'),(6,'Basit Harmonik Hareket'),(7,'Dalga Mekaniği (İleri)')
) as t(ord, name) on true
where s.name = 'Fizik' and s.exam_type = 'AYT';

-- AYT Kimya
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Kimyasal Tepkimelerde Enerji'),(2,'Kimyasal Tepkime Hızı'),(3,'Kimyasal Denge'),
  (4,'Asit-Baz Dengesi'),(5,'Çözünürlük Dengesi'),(6,'Elektrokimya'),
  (7,'Karbon Kimyasına Giriş'),(8,'Organik Kimya')
) as t(ord, name) on true
where s.name = 'Kimya' and s.exam_type = 'AYT';

-- AYT Biyoloji
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Sinir Sistemi'),(2,'Endokrin Sistem'),(3,'Duyu Organları'),(4,'Destek ve Hareket Sistemi'),
  (5,'Sindirim Sistemi'),(6,'Dolaşım ve Bağışıklık Sistemi'),(7,'Solunum Sistemi'),
  (8,'Üriner Sistem'),(9,'Üreme Sistemi ve Embriyonik Gelişim'),(10,'Komünite ve Popülasyon Ekolojisi'),
  (11,'Genden Proteine'),(12,'Canlılarda Enerji Dönüşümleri'),(13,'Bitki Biyolojisi')
) as t(ord, name) on true
where s.name = 'Biyoloji' and s.exam_type = 'AYT';

-- AYT Edebiyat
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Anlam Bilgisi'),(2,'Şiir Bilgisi'),(3,'Edebi Sanatlar'),(4,'Anlatım Teknikleri'),
  (5,'Tanzimat ve Servet-i Fünun Dönemi'),(6,'Milli Edebiyat Dönemi'),
  (7,'Cumhuriyet Dönemi Türk Edebiyatı'),(8,'Dünya Edebiyatı')
) as t(ord, name) on true
where s.name = 'Edebiyat' and s.exam_type = 'AYT';

-- AYT Tarih
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'XX. Yüzyıl Başlarında Osmanlı ve Dünya'),(2,'I. Dünya Savaşı'),(3,'Milli Mücadele'),
  (4,'Atatürk İlkeleri ve İnkılap Tarihi'),(5,'İkinci Dünya Savaşı'),
  (6,'Soğuk Savaş Dönemi'),(7,'Yumuşama Dönemi ve Sonrası')
) as t(ord, name) on true
where s.name = 'Tarih' and s.exam_type = 'AYT';

-- AYT Coğrafya
insert into topics (subject_id, name, order_index)
select s.id, t.name, t.ord from subjects s
join (values
  (1,'Ekosistem'),(2,'Nüfus Politikaları'),(3,'Şehirler ve Etki Alanları'),
  (4,'Türkiye Ekonomisi'),(5,'Bölgeler ve Kalkınma'),(6,'Çevre ve Toplum'),
  (7,'Küresel Ortam: Bölgeler ve Ülkeler')
) as t(ord, name) on true
where s.name = 'Coğrafya' and s.exam_type = 'AYT';
