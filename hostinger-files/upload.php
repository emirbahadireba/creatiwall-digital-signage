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
    // Güvenlik kontrolü
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
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'image/jpg'];
    if (!in_array($file['type'], $allowed_types)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File type not allowed: ' . $file['type']]);
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