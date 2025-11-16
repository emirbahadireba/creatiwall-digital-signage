# 🚀 Hostinger Kurulum Rehberi - CreatiWall Media Upload

## 📋 Adım Adım Kurulum

### 1. Hostinger File Manager'a Giriş
1. Hostinger hesabınıza giriş yapın
2. **File Manager**'ı açın
3. **creatiwall.com** domain'inin **public_html/upload** klasörüne gidin
   - Path: `/home/u879963892/domains/creatiwall.com/public_html/upload`

### 2. Dosyaları Yükleme
Aşağıdaki dosyaları **public_html** klasörüne yükleyin:

#### A) Ana Dosyalar:
- `hostinger-files/upload.php` → `public_html/upload/upload.php`
- `hostinger-files/.htaccess` → `public_html/upload/.htaccess`

#### B) Media Klasörü:
- `hostinger-files/creatiwall-media/.htaccess` → `public_html/upload/creatiwall-media/.htaccess`

### 3. Klasör Yapısı (Hostinger'da)
```
/home/u879963892/domains/creatiwall.com/public_html/upload/
├── upload.php                    (Ana upload script)
├── .htaccess                     (CORS ve güvenlik)
└── creatiwall-media/             (Media dosyaları klasörü)
    ├── .htaccess                 (Media güvenlik)
    └── [yüklenen dosyalar]
```

### 4. İzinleri Ayarlama
File Manager'da sağ tık → **Permissions**:
- `upload.php` → **644**
- `.htaccess` → **644**
- `creatiwall-media/` klasörü → **755**
- `creatiwall-media/.htaccess` → **644**

### 5. Test Etme
1. Browser'da `https://creatiwall.com/upload/upload.php` adresine gidin
2. **"Method not allowed"** mesajı görürseniz ✅ **BAŞARILI**
3. Hata alırsanız dosya yollarını kontrol edin

### 6. Vercel Environment Variables
Vercel Dashboard → Settings → Environment Variables:
- `HOSTINGER_DOMAIN` = `creatiwall.com/upload`
- `HOSTINGER_UPLOAD_TOKEN` = `cwdg2025`
- `HOSTINGER_MEDIA_FOLDER` = `creatiwall-media`

### 7. Final Test
1. CreatiWall sistemine giriş yapın
2. **Media** → **Medya Yükle**
3. Bir resim seçin ve yükleyin
4. Başarılı olursa: `https://creatiwall.com/upload/creatiwall-media/` altında dosya görünür

## 🔧 Sorun Giderme

### Hata: "Unauthorized"
- Token'ı kontrol edin: `cwdg2025`
- Vercel environment variables'ı kontrol edin

### Hata: "File type not allowed"
- Sadece: JPG, PNG, GIF, MP4, WEBM dosyaları desteklenir

### Hata: "Upload failed"
- `creatiwall-media` klasörü izinlerini kontrol edin (755)
- PHP upload limitlerini kontrol edin

### Hata: "CORS"
- `.htaccess` dosyasının doğru yüklendiğini kontrol edin

## ✅ Başarı Kontrol Listesi

- [ ] `upload.php` dosyası yüklendi
- [ ] `.htaccess` dosyası yüklendi  
- [ ] `creatiwall-media` klasörü oluşturuldu
- [ ] İzinler ayarlandı (644/755)
- [ ] Vercel environment variables eklendi
- [ ] Test upload başarılı

## 🎯 Sonuç

Kurulum tamamlandığında:
- ✅ Medya dosyaları Hostinger'a yüklenir
- ✅ Metadata Supabase'e kaydedilir
- ✅ CreatiWall'da görüntülenir
- ✅ Hızlı CDN erişimi sağlanır

**Destek:** Sorun yaşarsanız error log'ları kontrol edin veya iletişime geçin.