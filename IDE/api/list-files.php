<?php
require __DIR__ . '/_bootstrap.php';
$project = $_GET['project'] ?? '';
$dir = project_dir($workspace, $project);
$src = $dir . DIRECTORY_SEPARATOR . 'src';
$files = [];
foreach (glob($src . DIRECTORY_SEPARATOR . '*.java') ?: [] as $f) $files[] = basename($f);
sort($files, SORT_NATURAL | SORT_FLAG_CASE);
$mainClass = 'MainForm';
if (is_file($dir . DIRECTORY_SEPARATOR . 'project.json')) {
    $meta = json_decode(file_get_contents($dir . DIRECTORY_SEPARATOR . 'project.json'), true);
    if (!empty($meta['mainClass'])) $mainClass = $meta['mainClass'];
}
respond(true, ['files'=>$files, 'mainClass'=>$mainClass]);
