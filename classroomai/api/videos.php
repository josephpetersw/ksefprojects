<?php
/**
 * api/videos.php — Sample Video Upload & Library API
 * Classroom AI · Kenya Science & Engineering Fair 62nd Edition
 *
 * GET  /api/videos.php          → list all videos
 * POST /api/videos.php          → upload a new video (multipart/form-data: file=)
 * DELETE /api/videos.php?id=x  → delete a video by filename
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ── Config ─────────────────────────────────────────── */
$videosDir = __DIR__ . '/../data/videos';
$maxSize = 200 * 1024 * 1024;  // 200 MB
$allowedExt = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
$allowedMime = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];

if (!is_dir($videosDir)) {
    mkdir($videosDir, 0755, true);
}

/* ── Helpers ─────────────────────────────────────────── */
function videoEntry($path, $filename, $videosDir)
{
    $fullPath = $videosDir . '/' . $filename;
    $size = file_exists($fullPath) ? filesize($fullPath) : 0;
    $mtime = file_exists($fullPath) ? filemtime($fullPath) : 0;
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $thumb = str_replace('.' . $ext, '.jpg', $filename);
    return [
        'id' => $filename,
        'filename' => $filename,
        'name' => pathinfo($filename, PATHINFO_FILENAME),
        'ext' => $ext,
        'size' => $size,
        'sizeStr' => formatSize($size),
        'uploaded' => date('c', $mtime),
        'url' => 'data/videos/' . rawurlencode($filename),
        'thumb' => file_exists($videosDir . '/' . $thumb) ? 'data/videos/' . rawurlencode($thumb) : null,
    ];
}

function formatSize($bytes)
{
    if ($bytes >= 1073741824)
        return round($bytes / 1073741824, 1) . ' GB';
    if ($bytes >= 1048576)
        return round($bytes / 1048576, 1) . ' MB';
    if ($bytes >= 1024)
        return round($bytes / 1024, 1) . ' KB';
    return $bytes . ' B';
}

/* ── GET: list videos ────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    $files = glob($videosDir . '/*.{mp4,webm,mov,avi,mkv}', GLOB_BRACE) ?: [];
    usort($files, fn($a, $b) => filemtime($b) - filemtime($a)); // newest first
    $videos = array_map(fn($f) => videoEntry($f, basename($f), $videosDir), $files);
    echo json_encode(['success' => true, 'videos' => $videos, 'count' => count($videos)]);
    exit;
}

/* ── POST: upload video ──────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $errCode = $_FILES['file']['error'] ?? 'no file';
        $errMap = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds server upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds form MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write to disk',
        ];
        http_response_code(400);
        echo json_encode(['error' => $errMap[$errCode] ?? 'Upload error: ' . $errCode]);
        exit;
    }

    $file = $_FILES['file'];
    $origName = basename($file['name']);
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    $mime = mime_content_type($file['tmp_name']);

    // Validate
    if (!in_array($ext, $allowedExt)) {
        http_response_code(415);
        echo json_encode(['error' => 'Unsupported file type: .' . $ext . '. Allowed: ' . implode(', ', $allowedExt)]);
        exit;
    }
    if (!in_array($mime, $allowedMime)) {
        http_response_code(415);
        echo json_encode(['error' => 'Invalid MIME type: ' . $mime]);
        exit;
    }
    if ($file['size'] > $maxSize) {
        http_response_code(413);
        echo json_encode(['error' => 'File too large. Maximum: 200 MB']);
        exit;
    }

    // Sanitise filename and ensure uniqueness
    $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($origName, PATHINFO_FILENAME));
    $safeName = substr($safeName, 0, 64);
    $timestamp = date('Ymd_His');
    $filename = $timestamp . '_' . $safeName . '.' . $ext;
    $destPath = $videosDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file to server']);
        exit;
    }

    // Write metadata sidecar
    $meta = [
        'original_name' => $origName,
        'filename' => $filename,
        'size' => $file['size'],
        'mime' => $mime,
        'uploaded' => date('c'),
        'label' => $_POST['label'] ?? '',
        'notes' => $_POST['notes'] ?? '',
    ];
    file_put_contents($videosDir . '/' . $timestamp . '_' . $safeName . '.json', json_encode($meta, JSON_PRETTY_PRINT));

    echo json_encode([
        'success' => true,
        'video' => videoEntry($destPath, $filename, $videosDir),
    ]);
    exit;
}

/* ── DELETE: remove a video ──────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'id parameter required']);
        exit;
    }

    // Security: strip any path separators
    $filename = basename($id);
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file']);
        exit;
    }

    $path = $videosDir . '/' . $filename;
    if (!file_exists($path)) {
        http_response_code(404);
        echo json_encode(['error' => 'Video not found']);
        exit;
    }

    unlink($path);

    // Also delete sidecar JSON if present
    $metaPath = preg_replace('/\.[a-z0-9]+$/i', '.json', $path);
    if (file_exists($metaPath))
        unlink($metaPath);

    echo json_encode(['success' => true, 'deleted' => $filename]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
