<?php
require __DIR__ . '/_bootstrap.php';
$project = $_GET['project'] ?? '';
$file = safe_java_file($_GET['file'] ?? '');
$dir = project_dir($workspace, $project);
$path = $dir . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . $file;
if (!is_file($path)) respond(false, ['error'=>'File not found.'], 404);
respond(true, ['file'=>$file, 'content'=>file_get_contents($path)]);
