<?php
header('Content-Type: application/json');

$key  = require __DIR__ . '/API.php';
$city = trim($_GET['city'] ?? '');
$lat  = $_GET['lat'] ?? '';
$lon  = $_GET['lon'] ?? '';

if ($city === '' && !(is_numeric($lat) && is_numeric($lon))) {
    http_response_code(400);
    echo json_encode(['error' => 'City or coordinates required']);
    exit;
}

function fetch_json($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($body, true)];
}

$params = ['units' => 'metric', 'appid' => $key];
if ($city !== '') {
    $params['q'] = $city;
} else {
    $params['lat'] = $lat;
    $params['lon'] = $lon;
}
$query = http_build_query($params);

[$code, $current] = fetch_json("https://api.openweathermap.org/data/2.5/weather?$query");
if ($code !== 200) {
    http_response_code($code ?: 502);
    echo json_encode(['error' => $current['message'] ?? 'Request failed']);
    exit;
}

[$fcode, $forecast] = fetch_json("https://api.openweathermap.org/data/2.5/forecast?$query");

echo json_encode([
    'current'  => $current,
    'forecast' => $fcode === 200 ? $forecast : null,
]);