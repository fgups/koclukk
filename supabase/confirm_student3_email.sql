-- iamfurkangul+student3@gmail.com hesabının e-postasını doğrudan onaylar.
update auth.users
set email_confirmed_at = now()
where email = 'iamfurkangul+student3@gmail.com'
  and email_confirmed_at is null;
