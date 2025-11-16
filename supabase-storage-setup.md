# Supabase Storage Setup Guide

## 1. Supabase Storage Bucket Oluşturma

Supabase Dashboard'da aşağıdaki adımları takip edin:

### Storage Bucket Oluşturma:
1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **Storage** sekmesine tıklayın
4. **Create Bucket** butonuna tıklayın
5. Bucket bilgilerini girin:
   - **Name**: `media-files`
   - **Public**: ✅ (Checked - dosyaların public erişilebilir olması için)
   - **File size limit**: `100 MB` (veya ihtiyacınıza göre)
   - **Allowed MIME types**: `image/*,video/*,audio/*` (veya `*/*` tüm dosya türleri için)

### Storage Policies (RLS) Ayarlama:

Bucket oluşturduktan sonra, dosya yükleme ve okuma izinleri için policies oluşturun:

#### 1. Upload Policy (Dosya Yükleme):
```sql
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media-files');
```

#### 2. Select Policy (Dosya Okuma):
```sql
CREATE POLICY "Allow public access to files" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'media-files');
```

#### 3. Delete Policy (Dosya Silme):
```sql
CREATE POLICY "Allow authenticated users to delete their files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'media-files');
```

## 2. Bucket URL Yapısı

Dosyalar şu URL formatında erişilebilir olacak:
```
https://ixqkqvhqfbpjpibhlqtb.supabase.co/storage/v1/object/public/media-files/[filename]
```

## 3. Test Etme

Storage bucket'ı oluşturduktan sonra:
1. CreatiWall uygulamasına gidin
2. Media Library'ye gidin
3. Bir dosya yüklemeyi deneyin
4. Dosyanın Supabase Storage'da görünüp görünmediğini kontrol edin

## 4. Troubleshooting

### Hata: "new row violates row-level security policy"
- Storage policies'lerin doğru ayarlandığından emin olun
- Bucket'ın public olarak ayarlandığından emin olun

### Hata: "Bucket not found"
- Bucket adının `media-files` olduğundan emin olun
- Bucket'ın oluşturulduğundan emin olun

### Hata: "File too large"
- Bucket'ın file size limit'ini kontrol edin
- Gerekirse limit'i artırın