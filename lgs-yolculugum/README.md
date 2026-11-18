# LGS Yolculuğum | Beylikdüzü RAM

8. sınıf öğrencilerine yönelik etkileşimli rehberlik ve iyi oluş platformu.

## Erişim
- Öğrenciler: https://osmannecat-hub.github.io/beylikduzu-ram/lgs-yolculugum/
- Yöneticiler: https://osmannecat-hub.github.io/beylikduzu-ram/lgs-yolculugum/#admin

## Öğrenci özellikleri
Altı temel modül, karar verme etkinlikleri, mini yarışma, haftalık çalışma planı, 60 saniyelik nefes molası, odak zamanlayıcısı, günlük alışkanlık takibi ve uygulama genelinde tek klasik yazı tipi (Georgia, serif).

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

## Geliştirilmiş psikoeğitim atölyeleri (17 Kasım 2026)

**Pilot sürümde iki modül altı aşamalı etkileşimli atölyeye dönüştürülmüştür.**
Diğer 11 öğrenci ve 5 veli modülü henüz eski kısa formatta kalmaktadır.

### Öğrenci atölyesi: Kaygımla Başa Çıkıyorum
1. Sınav heyecanının olası belirtilerini fark etme (öğrencinin verdiği seçimler saklanmaz).
2. Düşünce, duygu, bedensel tepki ve davranış eğilimini ayırma (4 eşleştirme).
3. Deneme öncesi, sınav sırasında ve deneme sonrası olmak üzere 3 karar durağı ve seçime özgü açıklamalar.
4. Yardımcı iç konuşma seçme.
5. Seçmeli 40 saniyelik yönlendirmeli nefes uygulaması veya 5-4-3-2-1 duyusal farkındalık.
6. "Şu durumda / şu adımı deneyeceğim" planı ve daha sonra günlük uygulama işaretleme.

### Veli atölyesi: Çocuğumun Sınav Kaygısına Destek
1. Ebeveynin ilk tepkisini fark etme.
2. Destekleyici ve zorlayıcı ifadeleri ayırma (4 eşleştirme).
3. Sınav öncesi kaygı, düşük deneme sonucu ve matematikte zorlanma senaryoları.
4. Duygu yansıtma, açık soru ve küçük adım içeren 3 aşamalı konuşma provası.
5. Yetişkinin kendi tepkisini düzenlemesine yönelik nefes veya duyusal farkındalık.
6. Aile iletişim planı ve günlük yaşamdaki uygulama işaretleme.

### Kayıt ve gizlilik
- Öğrenci atölye kaydı öğrenci hesabının var olan `lgs_student_progress.state.advancedModules.kaygi` alanında, veli kaydı `lgs_parent_progress.state.advancedModules.kaygi_destegi` alanında tutulur.
- Saklanan bilgiler: tamamlanan aşama numaraları, seçilmiş genel plan seçeneklerinin numaraları ve günlük uygulamanın tarihleri.
- Kaydedilmeyenler: kaygı belirtilerine ilişkin seçimler, soruların tekil yanıtları, iç konuşma metni, bireysel duygusal anlatılar ve çocuğa ilişkin özel notlar.
- Bu gösterge, kaygı düzeyi, psikolojik iyi oluş ya da beceri yeterliği için psikometrik bir puan olarak yorumlanmaz.
- Atölyeleri tamamlamak öğrenci/veli ana modül ilerlemesinde ilgili modülü tamamlandı olarak işaretler; önceki kısa modül tamamlamaları korunur.

### Teknik
- `workshops.js`: atölye içerikleri ve etkileşimleri.
- `index.html`: atölye teması, öğrenci modülüne yönlendirme.
- `family.js`: veli modülüne yönlendirme, veli kaydında alt aşamaların korunması, sıralı yazma işlemleri.
- `student.js`: atölye gelişim kartı.
- Yeni veritabanı tablosu veya kişisel bilgi alanı açılmadı.

### Kontroller
- JavaScript sözdizimi taraması tamamlandı.
- Modülün altı aşamasını ve tamamlanmasını sınayan birim düzeyi etkileşim testi geçildi.
- Ana sayfa -> öğrenci atölyesi -> veli ana sayfası -> veli atölyesi -> diğer öğrenci modülleri yönlendirmesi simüle edilerek test edildi.
- Gerçek öğrenci/veli hesaplarıyla canlı senkronizasyonun kurum içi pilotta ayrıca denenmesi gerekir.

Geliştirilmiş modüller şu anda yönetim panelinden düzenlenebilen standart içerik türleri değildir; bu pilot için uygulama koduna eklenmiştir. Yönetim paneline aşamalı atölye oluşturucu sonraki bir geliştirme olarak eklenebilir.


## Kapsamlı modüller, 8 aşamalı yapı (17 Kasım 2026)

Tüm **12 öğrenci** ve **6 veli** modülü özgün içeriklerle kapsamlı etkileşimli müfredata dönüştürüldü. Kaygı alanındaki iki eski 6 aşamalı temel atölye yerinde bırakıldı; aynı karttaki **İleri düzey** seçeneğiyle ek 8 aşamalı çalışma açılır.

**Her modülde yer alan sekiz aşama:**
1. Kişisel öğrenme hedefini seçme (yanıt geçici, kaydedilmez).
2. Dört ayrıntılı bilgi ve örnek kartını inceleme.
3. İki yaygın yanlış inanç ile daha esnek düşünceyi karşılaştırma.
4. İki açıklamalı mini bilgi sorusu (test puanı tutulmaz).
5. Gerçek yaşam kararı / senaryo 1 ve üç seçime özgü geri bildirim.
6. Gerçek yaşam kararı / senaryo 2 ve üç seçime özgü geri bildirim.
7. Üç küçük adımlı beceri uygulaması / davranış provası.
8. Günlük yaşam için durum ve baş etme adımı seçerek uygulama planı oluşturma.

**Tamamlanınca:** Son 7 güne ait günlük uygulama işaretleme seçeneği. Üç gün uygulamak şart değildir; işaretleme gelişim puanı olarak yorumlanmaz.

**Öğrenci içerikleri:** sınav kaygısı ileri düzey, planlama, dikkat, uyku/dinlenme, beden sağlığı, destek isteme, deneme analizi, sınav günü, erteleme, özgüven, dijital denge ve hedef sürekliliği.

**Veli içerikleri:** kaygı desteği ileri düzey, destekleyici iletişim, çalışma düzeni desteği, ailede uyku/dijital denge, deneme sonuçlarını konuşma, sınav haftası desteği.

### Kişisel veri ve ilerleme
- Öğrenci: \`lgs_student_progress.state.deepModules.<module_id>\`.
- Veli: \`lgs_parent_progress.state.deepModules.<module_id>\`.
- Saklanan: tamamlanan aşama numaraları, genel hazır seçeneklerden oluşturulan planın iki seçeneğinin numarası ve uygulama yapılan günlerin tarihleri.
- Kaydedilmeyen: başlangıçta seçilen güçlükler, tekil çoktan seçmeli yanıtlar, senaryodaki tercihler, kişisel duygu veya kaygı anlatıları.
- Gösterge **etkinliğe katılım** içindir, kişinin ruh sağlığı veya beceri yeterliği hakkında bir test sonucu değildir.
- Veliye sunulan çocuk özeti mevcut güvenlik sınırlarıyla yalnızca genel tamamlama sayılarını içerir.

### Dosyalar
- \`curriculum-data.js\`: 18 modüle özgü eğitim metinleri, sorular, senaryolar, beceri provası ve plan seçenekleri.
- \`curriculum.js\`: ortak etkileşim, aşama geçişi, sonuç ekranı, uygulama işaretleme ve ilerleme kartı.
- \`index.html\`: öğrenci modülleriyle bağlantı, yeni görsel düzen ve bağımlılıkların yüklenmesi.
- \`student.js\` ve \`family.js\`: ilgili kişisel panoda ayrıntılı atölye ilerlemesi, veli verisinin yeniden yüklenmesi.
- \`workshops.js\`: önceki iki temel kaygı atölyesi (korundu).

### Teknik kontrol
Modül veri şeması doğrulandı (12 öğrenci, 6 veli). 18 modülün tamamı simülasyonla başlangıç, 8 aşama, kişisel plan, tamamlama ve günlük işaretleme bakımından test edildi. Ana sitede öğrenci/veli atölye yönlendirmeleri test edildi. Gerçek kurum hesaplarıyla canlı ağ üzerinden pilot kayıt ve farklı cihazda tekrar giriş testleri hâlâ gereklidir.

**Önemli:** Bu program eğitim amaçlı prototiptir; kurum genelinde resmî kullanımdan önce alan uzmanlarının içerik incelemesi, öğrenci-veli bilgilendirmesi, veri saklama/silme süreçleri ve erişilebilirlik kontrolü gerekir.

## Tek klasik yazı tipi (18 Kasım 2026)

Yazı tipi seçim düğmesi ve değiştirme kodu kaldırıldı. Öğrenci, veli ve yönetici görünümleri, davet kodları ve form alanları Georgia, serif kullanır. Eski yerel font tercihi klasik değere dönüştürülür; diğer ilerleme alanları korunur. Hesaptan yüklenen tercihler de klasik değere normalize edilir.
