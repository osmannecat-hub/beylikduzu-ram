# Beylikdüzü RAM Okul Risk Haritası

Okulların **e-posta ile kaydolmasına gerek yoktur**. RAM yöneticisi panelde **Okul giriş şifreleri** bölümünden okula ilk şifre verir veya şifresini yeniler. Okul kullanıcıları ana ekranda okul adını seçer ve şifreyle giriş yapar. Eski e-posta hesapları ve RAM yöneticisinin mevcut e-posta oturumu geçiş süresince korunur.

## E-posta kullanılmadan okul girişi

- 253 okulun kimliği mevcut `ram_schools.id` ile belirlenir. Kurum kodları bazı kayıtlarda çakıştığından yalnızca koddan hesap belirlenmez.
- Şifre 28 karakterlik kriptografik rastgele değer olarak yöneticinin tarayıcısında üretilir ve **yalnızca ilk oluşturma/yenileme anında** gösterilir.
- `ram-school-credentials` Supabase Edge Function, RAM yöneticisinin Auth oturumunu doğrular; `ram_admins` yetkisi olmadan işlem yapmaz.
- Sunucu, `school-<school_uuid>@example.org` biçimindeki yalnızca iç kullanım amaçlı, rezerv edilmiş alan adına ait sanal oturum tanımlayıcısıyla `auth.admin.createUser(email_confirm=true)` eşdeğeri Auth Admin API çağrısı gerçekleştirir. Bu işlem doğrulama e-postası göndermez. Kullanıcıların bu adresle e-posta alma/şifre sıfırlama imkânı yoktur.
- Okul hesabı için `ram_school_logins` eşleştirmesi ve yalnızca o okul için `ram_memberships` yetkisi eklenir. Mevcut gönderimler `ram_submissions` tablosunda kalır; yeniden taşınmaz.
- Şifre kaybolursa RAM yöneticisi **Şifreyi yenile** seçeneğiyle yeni şifre üretir. Şifreleri mesajlaşma gruplarında herkese açık yayınlamayın.
- Yönetici hesabının e-posta/şifresi korunur. Eski onaylanmış öğretmen hesapları **RAM yöneticisi veya önceden e-posta hesabı olanlar** bölümünden geçiş süresince giriş yapabilir.


## Toplu okul şifresi oluşturma ve dağıtım

RAM yönetici panelinde **Tüm okullar için toplu şifre oluştur** bölümüne gidin ve **Şifresi olmayan tüm okullara şifre oluştur** düğmesini seçin. İşlem yalnızca aktif, daha önce şifresi tanımlanmamış okulları hedefler. Var olan şifreleri veya form kayıtlarını değiştirmez.

İşlem sırasında tek tek yetki denetimli sunucu isteği yapılır. İlerleme, başarı ve hata sayıları görüntülenir. Yönetici istediğinde işlemi durdurabilir veya o ana dek başarılı olan şifreleri CSV olarak indirebilir. Üç ardışık başarısızlıktan sonra işlem durur.

**CSV yalnızca başarıyla oluşturulan hesapların şifrelerini içerir.** Okul adı, kurum kodu, kademe, kurum türü, inceleme işareti, okul kimliği, giriş şifresi ve giriş adresi sütunları bulunur. Önceden oluşturulmuş hesapların şifreleri bu listede olmaz; kaybolan şifreler yönetici panelindeki **Okul şifresini yenile** aracılığıyla değiştirilir.

CSV hassas kimlik bilgileri içerir. Tüm dosyayı hiçbir okula veya ortak gruba göndermeyin. Her okulun satırını yalnızca kurumun doğrulanmış yetkilisine bireysel yolla iletin. Dosyayı erişim kontrollü bir yerde saklayın. Tarayıcı sekmesini kapatmadan CSV dosyasını indirin ve açılıp açılmadığını kontrol edin. Şifreler ne GitHub deposuna ne de açık metin halinde Supabase veri tablolarına kaydedilir.

**Dikkat:** Şifrelerin topluca üretimi yalnızca yönetici işlemi başlattığında gerçekleşir; kodun yayınlanması 253 okulun şifresinin kendiliğinden oluşturulduğu anlamına gelmez. Tüm okullarda gerçek tarayıcı testi henüz yapılmadığından önce bir okul hesabı açıp giriş sınamasını tamamlayın. Bazı okul kodlarında çakışma ve inceleme işaretli kayıtlar bulunduğundan CSV listesini dağıtmadan önce inceleyin.

## Kullanım

1. RAM yöneticisi siteye eski hesabıyla girer ve **Okul giriş şifreleri** bölümünü açar.
2. Okulu seçer, **İlk giriş şifresini oluştur** seçeneğine basar, çıkan şifreyi kopyalayıp **yalnızca okulun doğrulanmış yetkilisine** güvenli kanaldan iletir.
3. Okul kullanıcıları siteye girer, listeden okullarını seçip verilen şifreyle oturum açar.
4. Okul formunu doldurur, gönderir; RAM yöneticisi **Gönderilen Formlar** bölümünden görüntüler/siler.
5. Gerektiğinde RAM yöneticisi aynı bölümden okul şifresini yeniler. **Şifre yenileme daha önce açılmış oturumları otomatik olarak anında sonlandırmayabilir.** Ele geçirilmiş hesaplarda oturum iptali de gerekir.

## Dağıtım ve güvenlik

- Statik arayüz: GitHub Pages. Veritabanı ve kimlik doğrulama: Supabase.
- Service role anahtarı **yalnızca Edge Functions ortam değişkeninde** bulunur, asla GitHub deposuna veya web tarayıcısına konulmaz.
- Okul verileri RLS ile okul üyeliğine göre sınırlandırılır. Yalnızca RAM yöneticisi bütün okul gönderimlerini okur ve siler.
- Supabase Auth yönetim ekranında **genel yeni hesap kayıtlarını devre dışı bırakmak** önerilir (Allow new users to sign up: OFF). Bu ayar burada otomatik değiştirilemedi. Yönetici eliyle Auth Admin API üzerinden hesap açma akışı kalmalıdır.
- **Gerçek okul verileriyle geniş kullanıma geçmeden önce:** Yönetici girişinden bir okul için ilk şifre oluşturma, bu şifreyle okul girişi ve form gönderimini gerçek tarayıcıda uçtan uca test edin. Yanlış giriş, yenileme ve eski kullanıcı oturumlarını da doğrulayın.
- Kayıtlar yalnızca okul geneli 36 gösterge sayısını içerir. Öğrenci adı, T.C. kimlik numarası veya bireysel hassas veri girmeyin.
- Supabase yönetiminde güvenlik denetimlerini, parolaların sızdırılmış olma kontrolünü ve düzenli yedeklemeyi ele alın.
