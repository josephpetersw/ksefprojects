<?php
/**
 * api/sessions.php
 * Save and retrieve analysis sessions as JSON flat-file storage.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$dataDir  = __DIR__ . '/../data';
$dataFile = $dataDir . '/sessions.json';

// Ensure data directory exists
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

/* ─── GET: return all sessions ─── */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($dataFile)) {
        echo json_encode(['sessions' => [], 'count' => 0]);
        exit;
    }
    $data = json_decode(file_get_contents($dataFile), true) ?? ['sessions' => []];
    echo json_encode([
        'sessions' => $data['sessions'] ?? [],
        'count'    => count($data['sessions'] ?? []),
    ]);
    exit;
}

/* ─── POST: save a new session ─── */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $session = json_decode($raw, true);

    if (!$session) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON body']);
        exit;
    }

    // Load existing
    $data = ['sessions' => []];
    if (file_exists($dataFile)) {
        $data = json_decode(file_get_contents($dataFile), true) ?? ['sessions' => []];
    }

    // Prepend new session
    $session['server_time'] = date('c');
    array_unshift($data['sessions'], $session);

    // Keep max 500 sessions
    if (count($data['sessions']) > 500) {
        $data['sessions'] = array_slice($data['sessions'], 0, 500);
    }

    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true, 'total' => count($data['sessions'])]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
