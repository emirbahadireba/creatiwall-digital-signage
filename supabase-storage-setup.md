# Supabase Storage Setup Guide - AKILLI GÜVENLİK MODELİ

## 1. Supabase Storage Bucket Oluşturma

Supabase Dashboard'da aşağıdaki adımları takip edin:

### Storage Bucket Oluşturma (AKILLI GÜVENLİK):
1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **Storage** sekmesine tıklayın
4. **Create Bucket** butonuna tıklayın
5. Bucket bilgilerini girin:
   - **Name**: `media-files`
   - **Public**: ✅ **CHECKED** (Layout/Player erişimi için gerekli!)
   - **File size limit**: `100 MB` (veya ihtiyacınıza göre)
   - **Allowed MIME types**: `image/*,video/*,audio/*` (veya `*/*` tüm dosya türleri için)

✅ **AKILLI GÜVENLİK**: Public bucket + Database-level tenant filtreleme

### Storage Policies (RLS) Ayarlama - AKILLI GÜVENLİK:

Public bucket için basit policies oluşturun:

#### 1. Upload Policy (Sadece Authenticated Users):
```sql
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media-files');
```

#### 2. Select Policy (Public Access - Layout/Player için):
```sql
CREATE POLICY "Allow public access to files" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'media-files');
```

#### 3. Delete Policy (Sadece Authenticated Users):
```sql
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'media-files');
```

✅ **AKILLI GÜVENLİK**: Dosyalar public erişilebilir ama database'de tenant_id ile filtrelenir.

## 2. Akıllı Güvenlik URL Yapısı

Public bucket için **Direct URLs** kullanılır:
```
https://ixqkqvhqfbpjpibhlqtb.supabase.co/storage/v1/object/public/media-files/[filename]
```

### Akıllı Güvenlik Avantajları:
- ✅ Layout'lar ve Player'lar dosyalara erişebilir
- ✅ Database'de tenant_id ile filtreleme
- ✅ Sadece kendi tenant'ının medyalarını görebilir
- ✅ URL'ler basit ve hızlı erişim sağlar
- ✅ Digital signage sistemleri için optimize

## 3. Test Etme

Public bucket'ı oluşturduktan sonra:
1. CreatiWall uygulamasına gidin
2. Register/Login yapın
3. Media Library'ye gidin
4. Bir dosya yüklemeyi deneyin
5. Dosyanın public URL ile erişilebilir olduğunu kontrol edin
6. Layout Designer'da medyayı kullanmayı deneyin

## 4. Troubleshooting

### Hata: "new row violates row-level security policy"
- Storage policies'lerin doğru ayarlandığından emin olun
- Bucket'ın **PUBLIC** olarak ayarlandığından emin olun
- Kullanıcının authenticated olduğundan emin olun

### Hata: "Bucket not found"
- Bucket adının `media-files` olduğundan emin olun
- Bucket'ın oluşturulduğundan emin olun

### Hata: "File too large"
- Bucket'ın file size limit'ini kontrol edin
- Gerekirse limit'i artırın

### Hata: "Media not showing in layouts"
- Bucket'ın public olduğundan emin olun
- URL'lerin doğru formatda olduğundan emin olun

## 5. Akıllı Güvenlik Modeli

✅ **AKILLI ÇÖZÜM**: Public bucket + Database tenant filtreleme
❌ **ESKİ YÖNTEM**: Private bucket (layout'lar erişemez!)

Akıllı güvenlik modeli:
- ✅ Layout'lar ve Player'lar medyalara erişebilir
- ✅ Database'de tenant_id ile güvenlik sağlanır
- ✅ Kullanıcılar sadece kendi medyalarını görür
- ✅ Digital signage sistemleri için optimize
- ✅ Hızlı ve güvenilir erişim

### Güvenlik Katmanları:
1. **Authentication**: Sadece login kullanıcılar upload yapabilir
2. **Database Filtreleme**: tenant_id ile medyalar filtrelenir
3. **API Güvenliği**: Tüm endpoint'lerde tenant kontrolü
4. **Public Access**: Layout/Player'lar için gerekli erişim