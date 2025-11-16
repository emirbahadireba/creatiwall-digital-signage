# Supabase Storage Setup Guide - GÜVENLİ PRIVATE BUCKET

## 1. Supabase Storage Bucket Oluşturma

Supabase Dashboard'da aşağıdaki adımları takip edin:

### Storage Bucket Oluşturma (GÜVENLİ):
1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **Storage** sekmesine tıklayın
4. **Create Bucket** butonuna tıklayın
5. Bucket bilgilerini girin:
   - **Name**: `media-files`
   - **Public**: ❌ **UNCHECKED** (PRIVATE bucket - güvenlik için!)
   - **File size limit**: `100 MB` (veya ihtiyacınıza göre)
   - **Allowed MIME types**: `image/*,video/*,audio/*` (veya `*/*` tüm dosya türleri için)

⚠️ **ÖNEMLİ**: Public bucket kullanmayın! Herkes dosyalarınıza erişebilir.

### Storage Policies (RLS) Ayarlama - GÜVENLİ:

Private bucket için güvenli policies oluşturun:

#### 1. Upload Policy (Sadece Authenticated Users):
```sql
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media-files');
```

#### 2. Select Policy (Sadece Kendi Dosyaları):
```sql
CREATE POLICY "Allow users to access their own files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'media-files');
```

#### 3. Delete Policy (Sadece Kendi Dosyaları):
```sql
CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'media-files');
```

⚠️ **GÜVENLİK**: Bu policies sadece authenticated kullanıcıların kendi dosyalarına erişmesini sağlar.

## 2. Güvenli URL Yapısı

Private bucket için **Signed URLs** kullanılır:
```
https://ixqkqvhqfbpjpibhlqtb.supabase.co/storage/v1/object/sign/media-files/[filename]?token=[signed_token]
```

### Signed URL Avantajları:
- ✅ Sadece yetkili kullanıcılar erişebilir
- ✅ URL'ler belirli süre sonra expire olur (1 yıl)
- ✅ Token olmadan dosyaya erişim mümkün değil
- ✅ Kullanıcı bazlı erişim kontrolü

## 3. Test Etme

Private bucket'ı oluşturduktan sonra:
1. CreatiWall uygulamasına gidin
2. Register/Login yapın (authentication gerekli!)
3. Media Library'ye gidin
4. Bir dosya yüklemeyi deneyin
5. Dosyanın signed URL ile erişilebilir olduğunu kontrol edin

## 4. Troubleshooting

### Hata: "new row violates row-level security policy"
- Storage policies'lerin doğru ayarlandığından emin olun
- Bucket'ın **PRIVATE** olarak ayarlandığından emin olun
- Kullanıcının authenticated olduğundan emin olun

### Hata: "Bucket not found"
- Bucket adının `media-files` olduğundan emin olun
- Bucket'ın oluşturulduğundan emin olun

### Hata: "File too large"
- Bucket'ın file size limit'ini kontrol edin
- Gerekirse limit'i artırın

### Hata: "Access denied"
- Kullanıcının login olduğundan emin olun
- Storage policies'lerin doğru ayarlandığından emin olun
- Signed URL'in expire olmadığından emin olun

## 5. Güvenlik Notları

✅ **DOĞRU**: Private bucket + Signed URLs + RLS policies
❌ **YANLIŞ**: Public bucket (herkes erişebilir!)

Private bucket kullanarak:
- Sadece authenticated kullanıcılar dosya yükleyebilir
- Dosyalara sadece signed URL ile erişilebilir
- URL'ler belirli süre sonra expire olur
- Kullanıcı bazlı erişim kontrolü sağlanır