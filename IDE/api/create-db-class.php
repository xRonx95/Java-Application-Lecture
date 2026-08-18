<?php
require __DIR__ . '/_bootstrap.php';
$d = input_json();
$project = $d['project'] ?? '';
$host = addslashes((string)($d['host'] ?? 'localhost'));
$port = preg_replace('/\D/', '', (string)($d['port'] ?? '3306')) ?: '3306';
$db = addslashes((string)($d['database'] ?? 'student_system'));
$user = addslashes((string)($d['user'] ?? 'root'));
$pass = addslashes((string)($d['password'] ?? ''));
$dir = project_dir($workspace, $project);
$code = <<<JAVA
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    private static final String URL = "jdbc:mysql://{$host}:{$port}/{$db}?useSSL=false&serverTimezone=UTC";
    private static final String USER = "{$user}";
    private static final String PASSWORD = "{$pass}";

    public static Connection connect() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
JAVA;
file_put_contents($dir . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . 'DBConnection.java', $code);
respond(true, ['file'=>'DBConnection.java']);
