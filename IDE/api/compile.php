<?php
require __DIR__ . '/_bootstrap.php';
$d = input_json();
$project = $d['project'] ?? '';
$dir = project_dir($workspace, $project);
$src = $dir . DIRECTORY_SEPARATOR . 'src';
$build = $dir . DIRECTORY_SEPARATOR . 'build';
if (!is_dir($build)) @mkdir($build, 0775, true);
$files = glob($src . DIRECTORY_SEPARATOR . '*.java') ?: [];
if (!$files) respond(false, ['error'=>'No Java files found.'], 400);
$javac = java_bin('javac');
$jars = connector_jars();
$cp = implode(PATH_SEPARATOR, $jars);
$parts = [escapeshellarg($javac), '-encoding', 'UTF-8', '-d', escapeshellarg($build)];
if ($cp !== '') { $parts[] = '-cp'; $parts[] = escapeshellarg($cp); }
foreach ($files as $f) $parts[] = escapeshellarg($f);
$cmd = implode(' ', $parts) . ' 2>&1';
$out = [];
$code = 0;
exec($cmd, $out, $code);
respond($code === 0, ['exitCode'=>$code, 'output'=>implode("\n", $out), 'command'=>$cmd]);
