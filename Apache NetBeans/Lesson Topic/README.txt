RUN AND DEBUG JAVA — JFRAME LESSON MODULE
==========================================

CONTENTS
--------
RunDebugModule.java  Main JFrame application, lessons, activity, and quiz
ModuleTheme.java     Separate colors, fonts, buttons, and code-area styling
LessonTopic.java     Reusable lesson data model
run-debug.html       Mobile-responsive web lesson module
assets/css/          Separate stylesheet for run-debug.html
assets/js/           Navigation, activity, copy buttons, and scored quiz
RunDebugLesson.jar   Runnable Java desktop version

REQUIREMENTS
------------
Java Development Kit (JDK) 8 or newer

RUN IN VS CODE
--------------
1. Install the Extension Pack for Java.
2. Open this RunDebugJFrame folder in VS Code.
3. Open RunDebugModule.java.
4. Click the Run button above the main method.

RUN IN A TERMINAL
-----------------
Open a terminal inside this folder, then enter:

    javac ModuleTheme.java LessonTopic.java RunDebugModule.java
    java RunDebugModule

RUN THE HTML VERSION
--------------------
Open run-debug.html in any modern browser. Keep the assets folder beside the
HTML file so the separate CSS and JavaScript files load correctly.

WINDOW RESPONSIVENESS
---------------------
JFrame applications do not use CSS or mobile media queries. This project uses
BorderLayout, BoxLayout, JSplitPane, and JScrollPane so the lesson adjusts when
the desktop window is resized. ModuleTheme.java separates styling from content.

TEACHING FLOW
-------------
1. Explain Run vs. Debug and the compile-run cycle.
2. Demonstrate the six-step debugging process.
3. Show breakpoints and each step control.
4. Inspect variables, watches, and the call stack.
5. Compare syntax, runtime, and logic errors.
6. Read a sample stack trace.
7. Apply the troubleshooting checklist.
8. Let students solve the debugging activity.
9. Finish with the five-question knowledge check.
