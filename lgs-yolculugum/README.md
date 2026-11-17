# LGS Yolculuğum | Beylikdüzü RAM

8. sınıf öğrencilerine yönelik etkileşimli rehberlik ve iyi oluş platformu.

## Erişim
- Öğrenciler: https://osmannecat-hub.github.io/beylikduzu-ram/lgs-yolculugum/
- Yöneticiler: https://osmannecat-hub.github.io/beylikduzu-ram/lgs-yolculugum/#admin

## Öğrenci özellikleri
Altı temel modül, karar verme etkinlikleri, mini yarışma, haftalık çalışma planı, 60 saniyelik nefes molası, odak zamanlayıcısı, günlük alışkanlık takibi ve 3 farklı yazı tipi.

Öğrenci hesabı gerekmez. Görevler ve ilerleme yalnızca kullanılan tarayıcıda `localStorage` üzerinde saklanır. RAM tarafından eklenen yeni kütüphane etkinlikleri Supabase'den yüklenir. İnternet kesilirse temel modüller çalışmaya devam eder.

## Yönetici özellikleri
Yalnızca Supabase Auth üzerinde giriş yapmış ve `public.lgs_admins` tablosunda yetkilendirilmiş hesaplar içerik ekleyebilir/düzenleyebilir/silebilir.

1. Üst menüde **🔐 Yönetim** bölümünü açın.
2. Mevcut RAM yöneticisi hesabıyla giriş yapın.
3. **＋ Yeni etkinlik** seçin.
4. Tür olarak **Bilgilendirme**, **Mini test** veya **Uygulama bağlantısı** seçin.
5. Başlık, kategori, açıklama ve içerik alanlarını doldurun.
6. İsterseniz taslak kaydedin, isterseniz **Öğrencilere yayımla** kutusunu işaretleyin.
7. Yayımlanan içerik ana sayfa ve **Etkinlik kütüphanesi** bölümünde görünür.

Uygulama bağlantısı yalnızca HTTPS adresiyle eklenir ve yeni sekmede açılır. Yeni yürütülebilir HTML/JS oyun kodu bu panelden yüklenmez; oyun ayrı bir HTTPS adresinde barındırılıp bağlantısı eklenebilir. Öğrencilerden herhangi bir kişisel bilgi toplanmamalıdır.

## Altyapı
- GitHub Pages: `lgs-yolculugum/index.html`; mevcut RAM portalının kök dosyaları değiştirilmedi.
- Var olan Supabase projesinde yalnızca `public.lgs_admins` ve `public.lgs_activities` tabloları oluşturuldu.
- Supabase RLS: anonim kullanıcılar sadece yayımlanmış içerikleri okuyabilir; yönetici yazma işlemleri yetkili kullanıcıya özgüdür.
- Tarayıcıda yalnızca Supabase **publishable** anahtarı bulunur; secret / service-role anahtarı kullanılmaz.
- Yöneticinin oturumu bu sekmede saklanır; süresi dolarsa yeniden giriş gerekir.

## Güvenlik notları
- Uygulama bağlantıları `https://` ile sınırlandırılmıştır.
- Dinamik başlık, açıklama ve metinler HTML olarak değil kaçışlanmış metin olarak görüntülenir.
- Yeni yönetici yetkilendirmesi Supabase'de yapılmalıdır. Her giriş yapan kullanıcı yönetici değildir.
- Eğitim içerikleri bilgilendirme amaçlıdır, bireysel psikolojik değerlendirme yerine geçmez.


## Öğrenci hesabı ve ilerleme (Kasım 2026)

**Kişisel öğrenci alanı:** https://osmannecat-hub.github.io/beylikduzu-ram/lgs-yolculugum/ (menü: **👤 Gelişimim**).

### Yönetici: Tek kullanımlık kod üretme
1. Sitenin **🔐 Yönetim** bölümüne RAM yöneticisi hesabınızla giriş yapın.
2. **Öğrenci hesap kodları** bölümünden **10 kod üret** veya **30 kod üret** seçin.
3. Kodları kopyalayın ya da daha sonra **Kullanılmamış kodları göster** ile tekrar görüntüleyin.
4. Öğrencilere kodları bireysel olarak verin. Sınıf listesi veya ad-soyad ile ilişkilendirilmiş listeleri platforma yüklemeyin.

### Öğrenci: Hesabı oluşturma ve kullanma
1. **👤 Gelişimim** bölümüne gidin ve **İlk kez kayıt ol** seçin.
2. Rehber öğretmenden alınan \`LGS-XXXX-XXXX-XXXX\` biçimindeki **tek kullanımlık kodu** girin.
3. En az 10 karakterli, harf ve sayı içeren kendi şifrenizi belirleyin.
4. Sonraki günlerde aynı kod ve şifreyle **Giriş yap** bölümünden devam edin.
5. Modüller, tamamlanan görevler, mini test sonuçları ve günlük alışkanlıklar öğrenciye özel olarak kaydedilir.

Kayıt için gerçek isim, okul, telefon veya e-posta istenmez. Kod ve şifre unutulursa yönetici panelindeki **Öğrenci şifresini sıfırla** aracı yeni geçici şifre verir. Öğrenci hesabı bilgileri gizli tutulmalıdır.

### Veri koruma
- \`lgs_student_invites\`: kayıt için tek kullanımlık kodlar; yalnızca yönetici okuyabilir, öğrenci okuyamaz.
- \`lgs_student_progress\`: öğrenciye özel durum verisi; yalnızca kendi JWT kimliğiyle erişilir, **RLS etkin**.
- \`lgs-student-accounts\` Edge Function: yönetici kod üretimi, tek kullanımlık kodla kayıt, yönetici şifre sıfırlama. Fonksiyonda admin JWT'si bağımsız doğrulanır.
- Üyelik Supabase Auth üzerinden oluşturulur. İstemci yalnızca **publishable** anahtarını içerir, servis anahtarı sunucudadır.
- Misafir olarak (girişsiz) yapılan ilerleme aynı cihazdaki tarayıcıda tutulur; giriş yapınca **Bu cihazdaki eski ilerlememi aktar** seçeneğiyle istenirse aktarılabilir.
- Öğrenciler arası başarı sıralaması veya sınıf puan tablosu yoktur.
- Kurum çapında kullanmadan önce öğrenci/veli aydınlatma metni, veri saklama ve silme politikası değerlendirilmelidir.

### Kaynak dosyaları
- \`index.html\`: öğrenci modülleri, çalışma planı, mini sınav, yönetim ve öğrenci alanları.
- \`student.js\`: kodla giriş, ilerleme eşitleme, gelişim görünümü ve yönetici öğrenci kod işlemleri.
- Supabase Edge Function: \`lgs-student-accounts\`.

**Not:** Üyelik bağlantı ve sunucu erişimi gerektirir. Hesapsız öğrenci içerikleri sınırlı çevrimdışı kullanım sunabilir; girişle senkronizasyon internet gerektirir.

## Veli modülleri ve ebeveyn paneli (17 Kasım 2026)

- Veli bölümü: https://osmannecat-hub.github.io/beylikduzu-ram/lgs-yolculugum/#parent
- 12 öğrenci modülü: önceki 6 + deneme analizi, sınav günü, erteleme, özgüven, dijital denge ve hedef sürdürme.
- 6 veli modülü: destekleyici iletişim, sınav kaygısı desteği, çalışma düzeni, dijital denge, deneme sonuçlarına yaklaşım, sınav haftası.
- Veli kendi modüllerini okuyabilir ve tamamladıklarını kendi hesabına kaydedebilir.

### Çocuk onayıyla eşleştirme
1. Öğrenci 👤 Gelişimim bölümünde hesabına giriş yapar.
2. “Veli davet kodu oluştur” düğmesiyle 7 gün geçerli tek kullanımlık VELI-XXXX-XXXX-XXXX kodu oluşturur.
3. Veli 🏡 Velilere özel bölümünde, kod ve kendi belirlediği şifreyle kayıt olur; sonra aynı kodla giriş yapar.
4. Öğrenci kullanılmamış kodu iptal edebilir veya bağlı veli hesabının erişimini istediği zaman kaldırabilir.

### Veliye gösterilebilenler
- Tamamlanan öğrenci modülü sayısı (12 üzerinden).
- Eklenen ve tamamlanan çalışma hedefi sayıları.
- Tamamlanan etkinlik sayısı.
- Mini test deneme sayısı.

**Veliye gösterilmeyenler:** Öğrencinin görev metinleri, sınav/mini test puanları, cevapları, günlük alışkanlık ayrıntıları ve kişisel notları. Çocuklar arasında sıralama yoktur.

### Altyapı
- Supabase: lgs_parent_invites, lgs_parent_links, lgs_parent_progress; öğrenci ilerlemesi lgs_student_progress tablosunda kalır.
- Edge Function: lgs-family (kimlik/yetki denetimi, onaylı eşleştirme ve yalnızca sayı özetlerini sunma).
- Ön yüz: family.js; kendi parent_id kaydı için RLS erişimi.
- Her yeni sürüm, mevcut okul giriş portalını etkilemeyecek biçimde lgs-yolculugum/ altında tutulur.

**Pilot testi:** Kurum geneline açılmadan önce bir test öğrenci ve test veli hesabıyla davet, kayıt, senkronizasyon, erişim kaldırma senaryoları uçtan uca denenmelidir. Bu senaryolar henüz canlı hesaplarla doğrulanmadı. Öğrenci verilerinin işlenmesine yönelik aydınlatma, saklama ve silme politikaları ayrıca netleştirilmelidir.
