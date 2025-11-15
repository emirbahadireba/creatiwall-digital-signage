# CreatiWall - Digital Signage System

Modern bir digital signage yönetim platformu.

## Özellikler

- 🖥️ **Cihaz Yönetimi**: Birden fazla ekranı merkezi olarak yönetin
- 📁 **Medya Kütüphanesi**: Video, görsel ve diğer içerikleri yükleyin ve organize edin
- 🎨 **Layout Tasarımcısı**: Görsel drag-and-drop ile ekran düzenleri oluşturun
- 📋 **Playlist Yönetimi**: İçerikleri sıraya koyun ve döngüsel oynatın
- ⏰ **Zamanlama**: Belirli saatlerde ve günlerde otomatik yayın planlayın
- 📊 **Dashboard**: Sistem genel bakışı ve istatistikler

## Teknolojiler

### Frontend
- React 18 + TypeScript
- Vite
- Zustand (State Management)
- Tailwind CSS
- Framer Motion
- React Router

### Backend
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3)
- Multer (File Upload)

## Kurulum

### 1. Frontend Kurulumu

```bash
npm install
npm run dev
```

Frontend http://localhost:5173 adresinde çalışacak.

### 2. Backend Kurulumu

```bash
cd server
npm install
npm run dev
```

Backend http://localhost:3001 adresinde çalışacak.

## API Endpoints

### Devices
- `GET /api/devices` - Tüm cihazları listele
- `POST /api/devices` - Yeni cihaz ekle
- `PUT /api/devices/:id` - Cihaz güncelle
- `DELETE /api/devices/:id` - Cihaz sil

### Media
- `GET /api/media` - Tüm medya öğelerini listele
- `POST /api/media/upload` - Dosya yükle
- `POST /api/media` - URL ile medya ekle
- `PUT /api/media/:id` - Medya güncelle
- `DELETE /api/media/:id` - Medya sil

### Layouts
- `GET /api/layouts` - Tüm layout'ları listele
- `POST /api/layouts` - Yeni layout oluştur
- `PUT /api/layouts/:id` - Layout güncelle
- `DELETE /api/layouts/:id` - Layout sil

### Playlists
- `GET /api/playlists` - Tüm playlist'leri listele
- `POST /api/playlists` - Yeni playlist oluştur
- `PUT /api/playlists/:id` - Playlist güncelle
- `DELETE /api/playlists/:id` - Playlist sil

### Schedules
- `GET /api/schedules` - Tüm zamanlamaları listele
- `POST /api/schedules` - Yeni zamanlama oluştur
- `PUT /api/schedules/:id` - Zamanlama güncelle
- `DELETE /api/schedules/:id` - Zamanlama sil

## Veritabanı

SQLite veritabanı otomatik olarak `server/data/creatiwall.db` konumunda oluşturulur.

## Dosya Yükleme

Yüklenen dosyalar `server/uploads/` klasöründe saklanır ve `/uploads/` endpoint'i üzerinden erişilebilir.

## Geliştirme

```bash
# Frontend ve backend'i ayrı terminalerde çalıştırın
npm run dev        # Frontend
cd server && npm run dev  # Backend
```

## Lisans

Private - All rights reserved

