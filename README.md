# Beylikdüzü RAM okul risk haritası

GitHub Pages üzerinde statik arayüz, Supabase Auth ve RLS ile yetkili okul kayıtları. Depoda gerçek okul gösterge verisi veya gizli servis anahtarı bulunmaz. Kullanılan yayınlanabilir API anahtarı yalnızca RLS ile sınırlandırılmış erişim sağlar.

Öğretmen hesabını doğrular, okul erişimi ister ve RAM onayından sonra formu gönderir. RAM yöneticisi tüm kayıtları görür. Yönetici rolü tarayıcıdan atanamaz; yalnızca yetkili veritabanı kurulumu ile ram_admins tablosuna eklenir.

Kurum kodu çakışmaları olan  okul envanteri kayıtları RAM incelemesini bekler. Referans: https://beylikduzu.meb.gov.tr/

## İlk kurulum
Supabase Auth URL Configuration: Site URL ve Redirect URLs uygulamanın GitHub Pages adresine ayarlanmalıdır. İlk RAM yöneticisi doğrulanmış hesabıyla kayıt olur; kurulum yetkilisi doğrulanmış kullanıcı UUID'sini ram_admins tablosuna ekler. Kimlik doğrulama e-postalarının öğretmenlere gidebilmesi için üretimde kurumun onayladığı SMTP hizmeti kurulmalıdır; Supabase'in varsayılan e-posta hizmeti tüm öğretmen adreslerine gönderim sağlamayabilir.

Bu aşamalar tamamlanıp gerçek tarayıcıda giriş/gönderim kontrolü yapılmadan okullara dağıtmayın. Okul erişim isteklerinde yetkiyi RAM ayrıca doğrular.
