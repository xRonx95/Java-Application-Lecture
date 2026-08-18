<?php
require __DIR__ . '/_bootstrap.php';
$d = input_json();
$project = $d['project'] ?? '';
$mainClass = safe_java_ident($d['mainClass'] ?? 'MainForm', 'main class');
$dir = project_dir($workspace, $project);
$build = $dir . DIRECTORY_SEPARATOR . 'build';
if (!is_dir($build)) respond(false, ['error'=>'Compile the project first.'], 400);
$java = java_bin('java');
$cpParts = array_merge([$build], connector_jars());
$cp = implode(PATH_SEPARATOR, $cpParts);
$base = escapeshellarg($java) . ' -cp ' . escapeshellarg($cp) . ' ' . escapeshellarg($mainClass);

if (PHP_OS_FAMILY === 'Windows') {
    // Launch detached. Whether a Swing window is visible depends on how Apache is started.
    $cmd = 'cmd /c start "JFramePractice" /B ' . $base;
    @pclose(@popen($cmd, 'r'));
    respond(true, ['message'=>'Java launch command sent.', 'command'=>$cmd]);
} else {
    $cmd = $base . ' > /dev/null 2>&1 &';
    exec($cmd);
    respond(true, ['message'=>'Java launch command sent.', 'command'=>$cmd]);
}
