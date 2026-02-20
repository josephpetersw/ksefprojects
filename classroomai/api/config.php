<?php
/**
 * api/config.php
 * Read and write system settings to data/config.json
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$dataDir    = __DIR__ . '/../data';
$configFile = $dataDir . '/config.json';

$defaults = [
    'ai_sensitivity'    => 'medium',
    'alert_threshold'   => 5,
    'camera_resolution' => '720p',
    'detection_interval'=> 400,
];

if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);

/* ─── GET ─── */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($configFile)) {
        echo json_encode($defaults);
        exit;
    }
    $cfg = array_merge($defaults, json_decode(file_get_contents($configFile), true) ?? []);
    echo json_encode($cfg);
    exit;
}

/* ─── POST ─── */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $incoming = json_decode(file_get_contents('php://input'), true);
    if (!$incoming) { http_response_code(400); echo json_encode(['error'=>'Invalid JSON']); exit; }

    $existing = file_exists($configFile)
        ? json_decode(file_get_contents($configFile), true) ?? []
        : [];

    $merged = array_merge($defaults, $existing, $incoming);
    file_put_contents($configFile, json_encode($merged, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true, 'config' => $merged]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
