# 🌐 Hostinger Media Upload Entegrasyonu

## 📋 Gerekli Adımlar

### 1. Hostinger'da PHP Upload Script'i Oluşturma

Hostinger hosting'inizde `public_html` klasörüne aşağıdaki dosyaları oluşturun:

#### `upload.php` (Ana Upload Script)
```php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Güvenlik kontrolü (opsiyonel)
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $expected_token = 'Bearer cwdg2025'; // CreatiWall upload token
    
    if ($auth_header !== $expected_token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }
    
    // Dosya kontrolü
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        exit();
    }
    
    $file = $_FILES['file'];
    $folder = $_POST['folder'] ?? 'creatiwall-media';
    
    // Upload klasörü oluştur
    $upload_dir = __DIR__ . '/' . $folder . '/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Dosya adı ve yolu
    $filename = $file['name'];
    $target_path = $upload_dir . $filename;
    
    // Dosya türü kontrolü
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (!in_array($file['type'], $allowed_types)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File type not allowed']);
        exit();
    }
    
    // Dosya boyutu kontrolü (50MB max)
    if ($file['size'] > 50 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File too large']);
        exit();
    }
    
    // Dosyayı taşı
    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        $public_url = 'https://' . $_SERVER['HTTP_HOST'] . '/' . $folder . '/' . $filename;
        
        echo json_encode([
            'success' => true,
            'filename' => $filename,
            'url' => $public_url,
            'size' => $file['size'],
            'type' => $file['type']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Upload failed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
```

#### `.htaccess` (Güvenlik ve CORS)
```apache
# CORS Headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "POST, GET, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# Security
Options -Indexes
DirectoryIndex index.php index.html

# File Upload Limits
php_value upload_max_filesize 50M
php_value post_max_size 50M
php_value max_execution_time 300
```

### 2. Environment Variables Ayarlama

`.env.production` dosyasında Hostinger bilgilerinizi güncelleyin:

```env
# Hostinger Media Upload Configuration
HOSTINGER_DOMAIN=your-hostinger-domain.com
HOSTINGER_UPLOAD_TOKEN=creatiwall_secure_token_2024
HOSTINGER_MEDIA_FOLDER=creatiwall-media
```

**Gerçek Ayarlarınız:**
```env
HOSTINGER_DOMAIN=upload.creatiwall.com
HOSTINGER_UPLOAD_TOKEN=cwdg2025
HOSTINGER_MEDIA_FOLDER=creatiwall-media
```

### 3. Vercel Environment Variables

Vercel dashboard'da aşağıdaki environment variables'ları ekleyin:
- `HOSTINGER_DOMAIN` = upload.creatiwall.com
- `HOSTINGER_UPLOAD_TOKEN` = cwdg2025
- `HOSTINGER_MEDIA_FOLDER` = creatiwall-media

### 4. Güvenlik Token'ı Ayarlama

`upload.php` dosyasında token'ı environment variable ile eşleştirin:
```php
$expected_token = 'Bearer cwdg2025'; // .env'deki token ile aynı
```

### 5. Test Etme

1. Hostinger'a dosyaları yükleyin
2. `https://upload.creatiwall.com/upload.php` adresine GET isteği gönderin
3. "Method not allowed" mesajı alırsanız script çalışıyor demektir

### 6. Klasör İzinleri

Hostinger File Manager'da:
- `creatiwall-media` klasörüne 755 izni verin
- `upload.php` dosyasına 644 izni verin

## 🔧 Sorun Giderme

### Upload Başarısız Olursa:
1. PHP error log'larını kontrol edin
2. Dosya boyutu limitlerini kontrol edin
3. CORS ayarlarını kontrol edin
4. Klasör izinlerini kontrol edin

### Güvenlik:
- Token'ı güçlü yapın
- Sadece gerekli dosya türlerine izin verin
- Dosya boyutu limitini ayarlayın
- Upload klasörüne `.htaccess` ekleyin

## 📁 Klasör Yapısı (Hostinger)

```
public_html/
├── upload.php
├── .htaccess
└── creatiwall-media/
    ├── .htaccess (güvenlik için)
    └── [uploaded files]
```

## ✅ Tamamlandığında

Hostinger entegrasyonu tamamlandığında:
- Medya dosyaları gerçek sunucuda saklanır
- Hızlı CDN erişimi sağlanır
- Vercel serverless limitleri aşılmaz
- Maliyet etkin çözüm elde edilir