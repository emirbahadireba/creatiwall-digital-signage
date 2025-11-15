# CreatiWall Web Player

Tamamen bağımsız, React'tan ayrı bir web player.

## Kullanım

### 1. Lokal Test
```
http://localhost:5173/player.html?id=LAYOUT_ID
```

### 2. Production
```
https://yoursite.com/player.html?id=LAYOUT_ID
```

### 3. Kiosk Mode (Chrome)
```bash
chrome.exe --kiosk http://localhost:5173/player.html?id=LAYOUT_ID
```

### 4. Windows Startup (Kiosk)
`startup.bat` oluşturun:
```batch
@echo off
start chrome.exe --kiosk --app=http://localhost:5173/player.html?id=YOUR_LAYOUT_ID
```

## Özellikler

- ✅ Tamamen bağımsız HTML dosyası
- ✅ Backend'den layout ve media verilerini çeker
- ✅ Zone'ları position ve boyuta göre render eder
- ✅ Image, Video, Text zone'ları destekler
- ✅ Tam ekran mode (F11)
- ✅ ESC ile çıkış
- ✅ Otomatik tam ekran başlatma

## Zone Tipleri

- **media**: Image veya Video gösterir
- **text**: Metin içerik
- **playlist**: Playlist içerik (geliştirilecek)
- **clock**: Saat widget'ı
- **weather**: Hava durumu (geliştirilecek)
- **rss**: RSS feed (geliştirilecek)
- **widgets**: Genel widget'lar

## Backend Gereksinimleri

Player şu API endpoint'lerini kullanır:
- `GET /api/layouts/:id` - Layout ve zone bilgileri
- `GET /api/media` - Tüm medya öğeleri
- `GET /uploads/*` - Medya dosyaları

## Kiosk Deployment

### Windows
```batch
chrome.exe --kiosk --app=http://player.url/player.html?id=123
```

### Linux
```bash
chromium-browser --kiosk --app=http://player.url/player.html?id=123
```

### Android
WebView + Kiosk Launcher uygulaması kullanın.

