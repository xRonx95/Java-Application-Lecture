<?php
require __DIR__ . '/_bootstrap.php';
$items = [];
foreach (scandir($workspace) as $name) {
    if ($name === '.' || $name === '..') continue;
    if (is_dir($workspace . DIRECTORY_SEPARATOR . $name)) $items[] = $name;
}
sort($items, SORT_NATURAL | SORT_FLAG_CASE);
respond(true, ['projects' => $items]);
