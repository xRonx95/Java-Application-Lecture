<?php
require __DIR__ . '/_bootstrap.php';
$d = input_json();
$project = safe_name($d['project'] ?? '', 'project name');
$class = safe_java_ident($d['className'] ?? 'MainForm', 'class name');
$dir = $workspace . DIRECTORY_SEPARATOR . $project;
if (file_exists($dir)) respond(false, ['error' => 'Project already exists.'], 409);
@mkdir($dir . DIRECTORY_SEPARATOR . 'src', 0775, true);
$source = "import javax.swing.*;\n\npublic class {$class} extends JFrame {\n    public {$class}() {\n        setTitle(\"Main Form\");\n        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);\n        setSize(760, 500);\n        setLocationRelativeTo(null);\n    }\n\n    public static void main(String[] args) {\n        SwingUtilities.invokeLater(() -> new {$class}().setVisible(true));\n    }\n}\n";
file_put_contents($dir . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . $class . '.java', $source);
file_put_contents($dir . DIRECTORY_SEPARATOR . 'project.json', json_encode(['mainClass'=>$class], JSON_PRETTY_PRINT));
respond(true, ['project'=>$project, 'mainClass'=>$class]);
