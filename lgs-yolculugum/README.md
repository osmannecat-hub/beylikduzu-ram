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
