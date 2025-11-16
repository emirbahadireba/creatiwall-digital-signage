# 🪣 Supabase Storage Bucket Oluşturma - ADIM ADIM

## 1. 🆕 Yeni Bucket Oluşturma

### Supabase Dashboard'da:
1. **Storage** sekmesine gidin
2. **"New bucket"** butonuna tıklayın
3. Bucket bilgilerini girin:

```
Name: media-files
Public bucket: ✅ CHECKED (ÖNEMLİ!)
File size limit: 100 MB
Allowed MIME types: */* (tüm dosya türleri)
```

4. **"Create bucket"** butonuna tıklayın

## 2. 🔐 Storage Policies Ekleme

Bucket oluşturduktan sonra **Policies** sekmesine gidin ve şu 3 policy'yi ekleyin:

### Policy 1 - Upload (INSERT):
```sql
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media-files');
```

### Policy 2 - Select (SELECT):
```sql
CREATE POLICY "Allow public access to files" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'media-files');
```

### Policy 3 - Delete (DELETE):
```sql
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'media-files');
```

## 3. ✅ Kontrol Listesi

Bucket oluşturduktan sonra kontrol edin:
- [ ] Bucket adı: `media-files`
- [ ] Public bucket: ✅ CHECKED
- [ ] 3 policy mevcut (INSERT, SELECT, DELETE)
- [ ] File size limit: 100 MB
- [ ] MIME types: */*

## 4. 🧪 Test

Bucket hazır olduğunda CreatiWall uygulamasında media upload test edin.

## 🛡️ Güvenlik Notu:
Public bucket + tenant_id filtreleme = Akıllı güvenlik modeli
Kullanıcılar sadece kendi dosyalarını görür!