<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$workspace = realpath(__DIR__ . '/../workspace');
if ($workspace === false) {
    @mkdir(__DIR__ . '/../workspace', 0775, true);
    $workspace = realpath(__DIR__ . '/../workspace');
}

function respond($ok, $data = [], $status = 200) {
    http_response_code($status);
    echo json_encode(array_merge(['ok' => $ok], $data), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

function input_json() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $_POST;
}

function safe_name($name, $label = 'name') {
    $name = trim((string)$name);
    if ($name === '' || !preg_match('/^[A-Za-z_][A-Za-z0-9_-]{0,63}$/', $name)) {
        respond(false, ['error' => "Invalid $label. Use letters, numbers, underscore, or hyphen; do not begin with a number."], 400);
    }
    return $name;
}

function safe_java_ident($name, $label = 'Java identifier') {
    $name = trim((string)$name);
    if ($name === '' || !preg_match('/^[A-Za-z_$][A-Za-z0-9_$]*$/', $name)) {
        respond(false, ['error' => "Invalid $label."], 400);
    }
    return $name;
}

function safe_java_file($name) {
    $name = basename(trim((string)$name));
    if (!preg_match('/^[A-Za-z_$][A-Za-z0-9_$]*\.java$/', $name)) {
        respond(false, ['error' => 'Invalid Java filename.'], 400);
    }
    return $name;
}

function project_dir($workspace, $project) {
    $project = safe_name($project, 'project name');
    $path = $workspace . DIRECTORY_SEPARATOR . $project;
    $real = realpath($path);
    if ($real === false || strpos($real, $workspace) !== 0) {
        respond(false, ['error' => 'Project not found.'], 404);
    }
    return $real;
}

function java_bin($tool) {
    // Prefer JAVA_HOME when available, otherwise rely on PATH.
    $javaHome = getenv('JAVA_HOME');
    if ($javaHome) {
        $exe = rtrim($javaHome, "\\/") . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . $tool . (PHP_OS_FAMILY === 'Windows' ? '.exe' : '');
        if (is_file($exe)) return $exe;
    }
    return $tool;
}

function connector_jars() {
    $lib = realpath(__DIR__ . '/../lib');
    if (!$lib) return [];
    $files = glob($lib . DIRECTORY_SEPARATOR . '*.jar') ?: [];
    return array_values($files);
}
