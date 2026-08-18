<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'POST requests only.'
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Invalid JSON request.'
    ]);
    exit;
}

$host = trim((string)($input['host'] ?? 'localhost'));
$port = trim((string)($input['port'] ?? '3306'));
$database = trim((string)($input['database'] ?? ''));
$user = (string)($input['user'] ?? 'root');
$password = (string)($input['password'] ?? '');
$usersTable = trim((string)($input['usersTable'] ?? 'users'));

if ($database === '') {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'Database name is required.'
    ]);
    exit;
}

if (!preg_match('/^\d{1,5}$/', $port)) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'Invalid MySQL port.'
    ]);
    exit;
}

if (!preg_match('/^[A-Za-z0-9_]+$/', $usersTable)) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'Invalid users table name.'
    ]);
    exit;
}

try {
    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $pdo->query('SELECT 1');

    $quotedTable = str_replace('`', '``', $usersTable);
    $tableExists = true;

    try {
        $pdo->query("SELECT 1 FROM `{$quotedTable}` LIMIT 1");
    } catch (Throwable $ignored) {
        $tableExists = false;
    }

    echo json_encode([
        'ok' => true,
        'table_exists' => $tableExists,
        'message' => $tableExists
            ? "Connected successfully to '{$database}'. Authentication table '{$usersTable}' is ready."
            : "Connected successfully to '{$database}', but table '{$usersTable}' was not found. Run database_setup.sql first."
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Could not connect to MySQL. Check XAMPP, database name, user, password, and port.'
    ]);
}
