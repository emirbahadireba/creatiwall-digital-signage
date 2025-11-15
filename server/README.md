# CreatiWall Backend API

## Installation

```bash
cd server
npm install
```

### FFmpeg Installation (for video thumbnails)

Video thumbnail oluşturma için FFmpeg gereklidir:

**Windows:**
1. [FFmpeg'i indirin](https://ffmpeg.org/download.html)
2. ZIP dosyasını açın ve `ffmpeg.exe` dosyasını PATH'e ekleyin
3. Veya `choco install ffmpeg` (Chocolatey ile)

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
# veya
sudo yum install ffmpeg
```

FFmpeg yüklü değilse, video thumbnail'ları oluşturulamaz ancak sistem çalışmaya devam eder.

## Development

```bash
npm run dev
```

Server will run on http://localhost:3001

## API Endpoints

### Devices
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get device by ID
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Media
- `GET /api/media` - Get all media items
- `GET /api/media/:id` - Get media by ID
- `POST /api/media/upload` - Upload media file (multipart/form-data)
- `POST /api/media` - Create media item (URL)
- `PUT /api/media/:id` - Update media item
- `DELETE /api/media/:id` - Delete media item

### Layouts
- `GET /api/layouts` - Get all layouts
- `GET /api/layouts/:id` - Get layout by ID
- `POST /api/layouts` - Create layout
- `PUT /api/layouts/:id` - Update layout
- `DELETE /api/layouts/:id` - Delete layout

### Playlists
- `GET /api/playlists` - Get all playlists
- `GET /api/playlists/:id` - Get playlist by ID
- `POST /api/playlists` - Create playlist
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist

### Schedules
- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/:id` - Get schedule by ID
- `POST /api/schedules` - Create schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

## Database

SQLite database is automatically created in `data/creatiwall.db` on first run.

