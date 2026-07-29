-- Mert Aydın için deneme kaydı (bir önceki script'te bu kısım çalışmamış görünüyor)
insert into mock_exams (student_id, exam_name, exam_type, exam_date, subject_nets, total_net)
values (
  (select id from profiles where full_name = 'Mert Aydın' limit 1),
  'Karekök Yayınları TYT Deneme 3',
  'TYT',
  current_date - 2,
  '[
    {"subject_name":"Türkçe","correct":6,"wrong":6,"net":4.5},
    {"subject_name":"Matematik","correct":4,"wrong":8,"net":2},
    {"subject_name":"Geometri","correct":3,"wrong":4,"net":2},
    {"subject_name":"Fizik","correct":2,"wrong":4,"net":1},
    {"subject_name":"Kimya","correct":3,"wrong":4,"net":2},
    {"subject_name":"Biyoloji","correct":3,"wrong":2,"net":2.5},
    {"subject_name":"Tarih","correct":2,"wrong":2,"net":1.5},
    {"subject_name":"Coğrafya","correct":2,"wrong":4,"net":1},
    {"subject_name":"Felsefe","correct":2,"wrong":4,"net":1},
    {"subject_name":"Din Kültürü ve Ahlak Bilgisi","correct":2,"wrong":4,"net":1}
  ]'::jsonb,
  18.5
);
