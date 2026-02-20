<?php
header('Content-Type: application/json');

$cctvDir = '../cctv_room';
if (!is_dir($cctvDir)) {
    echo json_encode([]);
    exit;
}

$files = scandir($cctvDir);
$images = [];

foreach ($files as $file) {
    if ($file !== '.' && $file !== '..') {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            $images[] = $file;
        }
    }
}

echo json_encode($images);
