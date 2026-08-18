<?php
require __DIR__ . '/_bootstrap.php';
$d = input_json();
$project = $d['project'] ?? '';
$file = safe_java_file($d['file'] ?? '');
$content = (string)($d['content'] ?? '');
$dir = project_dir($workspace, $project);
$path = $dir . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . $file;
if (strlen($content) > 500000) respond(false, ['error'=>'File too large.'], 413);
file_put_contents($path, $content);
if (!empty($d['mainClass'])) {
    $mainClass = safe_java_ident($d['mainClass'], 'main class');
    file_put_contents($dir . DIRECTORY_SEPARATOR . 'project.json', json_encode(['mainClass'=>$mainClass], JSON_PRETTY_PRINT));
}
respond(true, ['saved'=>$file]);
