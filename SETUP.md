# CreatiWall Backend Kurulum ve Çalıştırma

## Backend'i Başlatma

Backend sunucusu çalışmıyorsa, dosya yükleme işlemleri "failed to fetch" hatası verecektir.

### 1. Backend'i Başlat

Yeni bir terminal penceresi açın ve şu komutu çalıştırın:

```bash
cd server
npm install
npm run dev
```

Backend http://localhost:3001 adresinde çalışacaktır.

### 2. Frontend'i Başlat

Başka bir terminal penceresi açın:

```bash
npm run dev
```

Frontend http://localhost:5173 adresinde çalışacaktır.

### 3. Kontrol

Backend'in çalıştığını kontrol etmek için tarayıcıda şu adresi açın:
http://localhost:3001/api/health

"status": "ok" mesajını görmelisiniz.

## Sorun Giderme

### "Failed to fetch" Hatası

1. Backend'in çalıştığından emin olun (http://localhost:3001/api/health)
2. Backend terminalinde hata mesajı var mı kontrol edin
3. Port 3001'in başka bir uygulama tarafından kullanılmadığından emin olun

### Dosya Yükleme Hatası

1. `server/uploads` klasörünün var olduğundan emin olun
2. Backend loglarını kontrol edin
3. Dosya boyutunun 500MB'dan küçük olduğundan emin olun

