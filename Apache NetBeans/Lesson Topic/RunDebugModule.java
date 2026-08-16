import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.event.ListSelectionEvent;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Interactive lesson module about running and debugging Java programs.
 * Compatible with Java 8 and later.
 */
public class RunDebugModule extends JFrame {
    private final List<LessonTopic> topics = createTopics();
    private final DefaultListModel<String> navigationModel = new DefaultListModel<>();
    private final JList<String> navigationList = new JList<>(navigationModel);
    private final JPanel lessonHost = new JPanel(new BorderLayout());
    private final CardLayout cardLayout = new CardLayout();
    private final JPanel lessonCards = new JPanel(cardLayout);
    private final JProgressBar progressBar = new JProgressBar();
    private final JButton previousButton = ModuleTheme.secondaryButton("← Previous");
    private final JButton nextButton = ModuleTheme.primaryButton("Next →");
    private int selectedIndex = 0;

    public RunDebugModule() {
        super("Run and Debug Java — Interactive Lesson Module");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(820, 560));
        setSize(1180, 760);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        add(createHeader(), BorderLayout.NORTH);
        add(createMainArea(), BorderLayout.CENTER);
        add(createFooter(), BorderLayout.SOUTH);

        navigationList.setSelectedIndex(0);
        showTopic(0);
    }

    private JPanel createHeader() {
        JPanel header = new JPanel(new BorderLayout(18, 6));
        header.setBackground(ModuleTheme.PRIMARY);
        header.setBorder(new EmptyBorder(18, 24, 18, 24));

        JLabel title = new JLabel("RUN & DEBUG JAVA");
        title.setForeground(Color.WHITE);
        title.setFont(new Font("SansSerif", Font.BOLD, 25));

        JLabel subtitle = new JLabel("Interactive lesson • examples • activities • quiz");
        subtitle.setForeground(new Color(238, 218, 226));
        subtitle.setFont(new Font("SansSerif", Font.PLAIN, 13));

        JPanel text = new JPanel();
        text.setOpaque(false);
        text.setLayout(new BoxLayout(text, BoxLayout.Y_AXIS));
        text.add(title);
        text.add(Box.createVerticalStrut(3));
        text.add(subtitle);

        JLabel badge = new JLabel("JAVA JFRAME", SwingConstants.CENTER);
        badge.setOpaque(true);
        badge.setForeground(ModuleTheme.PRIMARY_DARK);
        badge.setBackground(ModuleTheme.ACCENT);
        badge.setFont(new Font("SansSerif", Font.BOLD, 12));
        badge.setBorder(new EmptyBorder(8, 13, 8, 13));

        header.add(text, BorderLayout.WEST);
        header.add(badge, BorderLayout.EAST);
        return header;
    }

    private JComponent createMainArea() {
        for (int i = 0; i < topics.size(); i++) {
            LessonTopic topic = topics.get(i);
            navigationModel.addElement(String.format("%02d  %s", i + 1, topic.getTitle()));
            lessonCards.add(createTopicPanel(topic), "topic-" + i);
        }

        navigationModel.addElement(String.format("%02d  Debugging Activity", topics.size() + 1));
        lessonCards.add(createActivityPanel(), "activity");
        navigationModel.addElement(String.format("%02d  Knowledge Check", topics.size() + 2));
        lessonCards.add(createQuizPanel(), "quiz");

        navigationList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        navigationList.setFont(new Font("SansSerif", Font.PLAIN, 14));
        navigationList.setFixedCellHeight(42);
        navigationList.setBackground(new Color(248, 241, 244));
        navigationList.setForeground(ModuleTheme.PRIMARY_DARK);
        navigationList.setSelectionBackground(ModuleTheme.PRIMARY);
        navigationList.setSelectionForeground(Color.WHITE);
        navigationList.setBorder(new EmptyBorder(10, 8, 10, 8));
        navigationList.addListSelectionListener(this::navigationChanged);

        JScrollPane navigationScroll = new JScrollPane(navigationList);
        navigationScroll.setBorder(BorderFactory.createEmptyBorder());
        navigationScroll.setMinimumSize(new Dimension(220, 0));

        lessonHost.setBackground(ModuleTheme.BACKGROUND);
        lessonHost.setBorder(new EmptyBorder(18, 18, 18, 18));
        lessonHost.add(lessonCards, BorderLayout.CENTER);

        JSplitPane splitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT,
                navigationScroll, lessonHost);
        splitPane.setDividerLocation(275);
        splitPane.setResizeWeight(0.22);
        splitPane.setOneTouchExpandable(true);
        splitPane.setBorder(BorderFactory.createEmptyBorder());
        return splitPane;
    }

    private JPanel createTopicPanel(LessonTopic topic) {
        JPanel body = new JPanel();
        body.setBackground(ModuleTheme.SURFACE);
        body.setLayout(new BoxLayout(body, BoxLayout.Y_AXIS));
        body.setBorder(new EmptyBorder(24, 28, 30, 28));

        body.add(heading(topic.getTitle(), 27, ModuleTheme.PRIMARY_DARK));
        body.add(Box.createVerticalStrut(12));
        body.add(infoBox("Learning objective", topic.getObjective(), new Color(255, 247, 219)));
        body.add(Box.createVerticalStrut(16));
        body.add(sectionTitle("Lesson discussion"));
        body.add(Box.createVerticalStrut(7));
        body.add(wrappedText(topic.getExplanation()));

        if (topic.getCode() != null && !topic.getCode().trim().isEmpty()) {
            body.add(Box.createVerticalStrut(18));
            body.add(sectionTitle("Example code / command"));
            body.add(Box.createVerticalStrut(7));
            JScrollPane codeScroll = new JScrollPane(ModuleTheme.codeArea(topic.getCode()));
            codeScroll.setBorder(BorderFactory.createEmptyBorder());
            codeScroll.setAlignmentX(Component.LEFT_ALIGNMENT);
            codeScroll.setPreferredSize(new Dimension(700, Math.min(220,
                    58 + topic.getCode().split("\\n").length * 20)));
            codeScroll.setMaximumSize(new Dimension(Integer.MAX_VALUE, 230));
            body.add(codeScroll);
        }

        body.add(Box.createVerticalStrut(18));
        body.add(infoBox("Teacher explanation tip", topic.getTeacherTip(),
                new Color(235, 247, 241)));
        body.add(Box.createVerticalGlue());

        JScrollPane scroll = new JScrollPane(body);
        scroll.setBorder(ModuleTheme.cardBorder());
        scroll.getVerticalScrollBar().setUnitIncrement(16);
        JPanel wrapper = new JPanel(new BorderLayout());
        wrapper.setBackground(ModuleTheme.BACKGROUND);
        wrapper.add(scroll, BorderLayout.CENTER);
        return wrapper;
    }

    private JPanel createActivityPanel() {
        JPanel body = new JPanel();
        body.setBackground(ModuleTheme.SURFACE);
        body.setLayout(new BoxLayout(body, BoxLayout.Y_AXIS));
        body.setBorder(new EmptyBorder(24, 28, 30, 28));

        body.add(heading("Debugging Activity: Find the Bugs", 27, ModuleTheme.PRIMARY_DARK));
        body.add(Box.createVerticalStrut(10));
        body.add(wrappedText("Study the program below. Predict what will happen, identify the bugs, "
                + "and decide where you would place a breakpoint before revealing the solution."));
        body.add(Box.createVerticalStrut(14));

        String brokenCode = "public class GradeChecker {\n"
                + "    public static void main(String[] args) {\n"
                + "        int[] grades = {88, 92, 79};\n"
                + "        int total = 0;\n\n"
                + "        for (int i = 0; i <= grades.length; i++) {\n"
                + "            total =+ grades[i];\n"
                + "        }\n\n"
                + "        double average = total / grades.length;\n"
                + "        System.out.println(\"Average: \" + average);\n"
                + "    }\n"
                + "}";
        JScrollPane codeScroll = new JScrollPane(ModuleTheme.codeArea(brokenCode));
        codeScroll.setAlignmentX(Component.LEFT_ALIGNMENT);
        codeScroll.setMaximumSize(new Dimension(Integer.MAX_VALUE, 300));
        body.add(codeScroll);
        body.add(Box.createVerticalStrut(15));

        JTextArea solution = new JTextArea(
                "1. Runtime error: i <= grades.length goes past the last array index. "
                        + "Change <= to <.\n\n"
                        + "2. Logic error: total =+ grades[i] replaces total each time. "
                        + "Change =+ to +=.\n\n"
                        + "3. Accuracy issue: integer division removes decimals. Use "
                        + "double average = (double) total / grades.length;.\n\n"
                        + "Suggested breakpoint: the first line inside the loop. Watch i, "
                        + "grades[i], and total while using Step Over.");
        solution.setEditable(false);
        solution.setLineWrap(true);
        solution.setWrapStyleWord(true);
        solution.setFont(new Font("SansSerif", Font.PLAIN, 14));
        solution.setForeground(ModuleTheme.TEXT);
        solution.setBackground(new Color(235, 247, 241));
        solution.setBorder(new EmptyBorder(15, 17, 15, 17));
        solution.setVisible(false);
        solution.setAlignmentX(Component.LEFT_ALIGNMENT);

        JButton reveal = ModuleTheme.primaryButton("Reveal solution");
        reveal.setAlignmentX(Component.LEFT_ALIGNMENT);
        reveal.addActionListener(e -> {
            solution.setVisible(!solution.isVisible());
            reveal.setText(solution.isVisible() ? "Hide solution" : "Reveal solution");
            body.revalidate();
        });
        body.add(reveal);
        body.add(Box.createVerticalStrut(12));
        body.add(solution);
        body.add(Box.createVerticalGlue());

        return scrollWrapper(body);
    }

    private JPanel createQuizPanel() {
        JPanel body = new JPanel();
        body.setBackground(ModuleTheme.SURFACE);
        body.setLayout(new BoxLayout(body, BoxLayout.Y_AXIS));
        body.setBorder(new EmptyBorder(24, 28, 30, 28));
        body.add(heading("Knowledge Check", 27, ModuleTheme.PRIMARY_DARK));
        body.add(Box.createVerticalStrut(8));
        body.add(wrappedText("Select one answer for each question, then click Check Answers."));
        body.add(Box.createVerticalStrut(16));

        List<ButtonGroup> groups = new ArrayList<>();
        List<Integer> correctAnswers = Arrays.asList(1, 2, 0, 1, 2);
        String[][] quiz = {
                {"1. What is the main purpose of a breakpoint?",
                        "To permanently stop a program", "To pause execution and inspect state",
                        "To automatically correct errors"},
                {"2. Which control enters a called method?",
                        "Resume", "Step Over", "Step Into"},
                {"3. Which error occurs while the program is executing?",
                        "Runtime error", "Syntax error", "Formatting error"},
                {"4. Which expression correctly adds a value to total?",
                        "total =+ value", "total += value", "total == value"},
                {"5. What should you do before changing code during debugging?",
                        "Guess randomly", "Delete the method", "Reproduce and observe the problem"}
        };

        for (String[] question : quiz) {
            JPanel questionPanel = new JPanel();
            questionPanel.setLayout(new BoxLayout(questionPanel, BoxLayout.Y_AXIS));
            questionPanel.setBackground(new Color(249, 249, 251));
            questionPanel.setBorder(ModuleTheme.cardBorder());
            questionPanel.setAlignmentX(Component.LEFT_ALIGNMENT);
            questionPanel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 165));

            JLabel prompt = new JLabel("<html><b>" + question[0] + "</b></html>");
            prompt.setForeground(ModuleTheme.TEXT);
            prompt.setAlignmentX(Component.LEFT_ALIGNMENT);
            questionPanel.add(prompt);
            questionPanel.add(Box.createVerticalStrut(7));

            ButtonGroup group = new ButtonGroup();
            for (int answerIndex = 1; answerIndex < question.length; answerIndex++) {
                JRadioButton option = new JRadioButton(question[answerIndex]);
                option.setActionCommand(String.valueOf(answerIndex - 1));
                option.setOpaque(false);
                option.setForeground(ModuleTheme.TEXT);
                option.setAlignmentX(Component.LEFT_ALIGNMENT);
                group.add(option);
                questionPanel.add(option);
            }
            groups.add(group);
            body.add(questionPanel);
            body.add(Box.createVerticalStrut(10));
        }

        JLabel result = new JLabel(" ");
        result.setFont(new Font("SansSerif", Font.BOLD, 16));
        result.setAlignmentX(Component.LEFT_ALIGNMENT);

        JButton check = ModuleTheme.primaryButton("Check Answers");
        check.setAlignmentX(Component.LEFT_ALIGNMENT);
        check.addActionListener((ActionEvent e) -> {
            int score = 0;
            int unanswered = 0;
            for (int i = 0; i < groups.size(); i++) {
                ButtonModel selection = groups.get(i).getSelection();
                if (selection == null) {
                    unanswered++;
                } else if (Integer.parseInt(selection.getActionCommand()) == correctAnswers.get(i)) {
                    score++;
                }
            }
            if (unanswered > 0) {
                result.setForeground(ModuleTheme.DANGER);
                result.setText("Please answer all questions. Unanswered: " + unanswered);
            } else {
                result.setForeground(score >= 4 ? ModuleTheme.SUCCESS : ModuleTheme.PRIMARY);
                result.setText("Your score: " + score + "/5 — "
                        + (score == 5 ? "Excellent debugging knowledge!"
                        : score >= 4 ? "Great work!" : "Review the topics and try again."));
            }
        });
        body.add(Box.createVerticalStrut(5));
        body.add(check);
        body.add(Box.createVerticalStrut(12));
        body.add(result);
        return scrollWrapper(body);
    }

    private JPanel createFooter() {
        JPanel footer = new JPanel(new BorderLayout(18, 0));
        footer.setBackground(ModuleTheme.SURFACE);
        footer.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(1, 0, 0, 0, new Color(224, 226, 232)),
                new EmptyBorder(10, 20, 10, 20)));

        int total = topics.size() + 2;
        progressBar.setMinimum(1);
        progressBar.setMaximum(total);
        progressBar.setValue(1);
        progressBar.setStringPainted(true);
        progressBar.setString("Topic 1 of " + total);
        progressBar.setPreferredSize(new Dimension(250, 22));

        previousButton.addActionListener(e -> navigate(-1));
        nextButton.addActionListener(e -> navigate(1));

        JPanel buttons = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        buttons.setOpaque(false);
        buttons.add(previousButton);
        buttons.add(nextButton);

        footer.add(progressBar, BorderLayout.WEST);
        footer.add(buttons, BorderLayout.EAST);
        return footer;
    }

    private void navigationChanged(ListSelectionEvent event) {
        if (!event.getValueIsAdjusting() && navigationList.getSelectedIndex() >= 0) {
            showTopic(navigationList.getSelectedIndex());
        }
    }

    private void navigate(int direction) {
        int target = Math.max(0, Math.min(navigationModel.size() - 1,
                selectedIndex + direction));
        navigationList.setSelectedIndex(target);
        navigationList.ensureIndexIsVisible(target);
    }

    private void showTopic(int index) {
        selectedIndex = index;
        if (index < topics.size()) {
            cardLayout.show(lessonCards, "topic-" + index);
        } else if (index == topics.size()) {
            cardLayout.show(lessonCards, "activity");
        } else {
            cardLayout.show(lessonCards, "quiz");
        }

        int total = navigationModel.size();
        progressBar.setValue(index + 1);
        progressBar.setString("Topic " + (index + 1) + " of " + total);
        previousButton.setEnabled(index > 0);
        nextButton.setEnabled(index < total - 1);
        nextButton.setText(index == total - 2 ? "Take Quiz →" : "Next →");
    }

    private static JPanel scrollWrapper(JPanel body) {
        JScrollPane scroll = new JScrollPane(body);
        scroll.setBorder(ModuleTheme.cardBorder());
        scroll.getVerticalScrollBar().setUnitIncrement(16);
        JPanel wrapper = new JPanel(new BorderLayout());
        wrapper.setBackground(ModuleTheme.BACKGROUND);
        wrapper.add(scroll, BorderLayout.CENTER);
        return wrapper;
    }

    private static JLabel heading(String text, int size, Color color) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("SansSerif", Font.BOLD, size));
        label.setForeground(color);
        label.setAlignmentX(Component.LEFT_ALIGNMENT);
        return label;
    }

    private static JLabel sectionTitle(String text) {
        return heading(text, 17, ModuleTheme.PRIMARY);
    }

    private static JTextArea wrappedText(String text) {
        JTextArea area = new JTextArea(text);
        area.setEditable(false);
        area.setLineWrap(true);
        area.setWrapStyleWord(true);
        area.setOpaque(false);
        area.setForeground(ModuleTheme.TEXT);
        area.setFont(new Font("SansSerif", Font.PLAIN, 15));
        area.setAlignmentX(Component.LEFT_ALIGNMENT);
        area.setBorder(BorderFactory.createEmptyBorder());
        area.setMaximumSize(new Dimension(Integer.MAX_VALUE, Integer.MAX_VALUE));
        return area;
    }

    private static JPanel infoBox(String title, String text, Color color) {
        JPanel box = new JPanel();
        box.setLayout(new BoxLayout(box, BoxLayout.Y_AXIS));
        box.setBackground(color);
        box.setBorder(new EmptyBorder(13, 15, 13, 15));
        box.setAlignmentX(Component.LEFT_ALIGNMENT);
        box.setMaximumSize(new Dimension(Integer.MAX_VALUE, 150));
        box.add(heading(title, 14, ModuleTheme.PRIMARY_DARK));
        box.add(Box.createVerticalStrut(5));
        box.add(wrappedText(text));
        return box;
    }

    private static List<LessonTopic> createTopics() {
        return Arrays.asList(
                new LessonTopic(
                        "Run vs. Debug",
                        "Differentiate normal execution from debugging execution.",
                        "Run executes the program normally from beginning to end. Debug also "
                                + "executes the program, but it lets the programmer pause it, inspect "
                                + "values, follow control flow, and locate the cause of incorrect behavior. "
                                + "A program can run without crashing and still contain logic errors.",
                        "// Normal run\njava HelloWorld\n\n// Compile first when using a terminal\njavac HelloWorld.java",
                        "Compare debugging to pausing a recorded game: you can stop at an important "
                                + "moment and study exactly what each player is doing."),
                new LessonTopic(
                        "Compile and Run Java",
                        "Describe the compile-run cycle and execute a basic Java program.",
                        "Java source code is saved in a .java file. The javac compiler checks its "
                                + "syntax and creates bytecode in a .class file. The java command starts "
                                + "the Java Virtual Machine (JVM), loads that bytecode, and executes main. "
                                + "The filename must match the public class name.",
                        "public class HelloWorld {\n"
                                + "    public static void main(String[] args) {\n"
                                + "        System.out.println(\"Hello, debugger!\");\n"
                                + "    }\n"
                                + "}\n\n"
                                + "// Terminal commands:\n"
                                + "javac HelloWorld.java\n"
                                + "java HelloWorld",
                        "Ask learners to identify the source file, compiler, bytecode file, JVM, "
                                + "and program output as stages of one cycle."),
                new LessonTopic(
                        "The Debugging Process",
                        "Apply a repeatable debugging method instead of guessing.",
                        "Use this six-step method: (1) reproduce the problem consistently, (2) read "
                                + "the error message and stack trace, (3) form a specific hypothesis, "
                                + "(4) collect evidence with breakpoints, watches, or temporary output, "
                                + "(5) make one focused correction, and (6) run tests again. Debugging "
                                + "is an evidence-based investigation, not random code changing.",
                        "Observe → Hypothesize → Test → Fix → Verify",
                        "Demonstrate a wrong answer first. Let students predict the cause before "
                                + "showing them the debugger."),
                new LessonTopic(
                        "Breakpoints",
                        "Place useful breakpoints and explain what happens when one is reached.",
                        "A breakpoint is a marker that pauses the program before a selected line "
                                + "executes. At that moment, you can inspect local variables, object "
                                + "fields, parameters, the call stack, and active threads. Place a "
                                + "breakpoint near the first line where the state becomes suspicious. "
                                + "Conditional breakpoints pause only when an expression is true, such "
                                + "as i == 50 or balance < 0.",
                        "for (int i = 0; i < scores.length; i++) {\n"
                                + "    total += scores[i]; // Breakpoint here\n"
                                + "}\n\n"
                                + "// Useful condition: i == 2",
                        "Explain that a breakpoint does not fix or permanently stop the program. "
                                + "It temporarily freezes the current execution for inspection."),
                new LessonTopic(
                        "Step Controls",
                        "Choose correctly among Step Over, Step Into, Step Out, Resume, and Stop.",
                        "Step Over executes the current line and pauses at the next line in the same "
                                + "method. Step Into enters a method call so you can inspect it line by "
                                + "line. Step Out finishes the current method and returns to its caller. "
                                + "Resume continues until the next breakpoint or the end. Stop terminates "
                                + "the current debugging session. Restart stops and starts again.",
                        "double finalPrice = calculateDiscount(price);\n"
                                + "printReceipt(finalPrice);\n\n"
                                + "// Step Into: inspect calculateDiscount\n"
                                + "// Step Over: run it as one line\n"
                                + "// Step Out: finish it and return here",
                        "Use a small method call and ask: 'Do we suspect the method itself?' If yes, "
                                + "Step Into; if no, Step Over."),
                new LessonTopic(
                        "Inspect Program State",
                        "Use Variables, Watches, and the Call Stack to explain program behavior.",
                        "The Variables panel shows values currently in scope. A Watch evaluates a "
                                + "chosen expression whenever execution pauses. The Call Stack shows the "
                                + "chain of method calls that led to the current line. Hover evaluation "
                                + "offers a quick value preview. Change values only for experiments; the "
                                + "real fix should normally be made in source code.",
                        "// Helpful watch expressions\n"
                                + "index\n"
                                + "items.length\n"
                                + "items[index]\n"
                                + "total / (double) items.length",
                        "At a breakpoint, ask three questions: What values do I have? How did I get "
                                + "here? What line will execute next?"),
                new LessonTopic(
                        "Types of Errors",
                        "Classify syntax, runtime, and logic errors using evidence.",
                        "A syntax or compile-time error violates Java language rules and prevents "
                                + "successful compilation. A runtime error occurs while the program is "
                                + "executing, often producing an exception and stack trace. A logic error "
                                + "allows the program to finish but produces an incorrect result. Some "
                                + "IDE warnings are not errors, but they may point to risky or unused code.",
                        "// Syntax error: missing ;\nint age = 18\n\n"
                                + "// Runtime error\nint x = 10 / 0;\n\n"
                                + "// Logic error: should multiply\nint area = length + width;",
                        "Give three examples and ask students whether the program will compile, crash, "
                                + "or finish with the wrong answer."),
                new LessonTopic(
                        "Stack Traces and Exceptions",
                        "Read an exception message from the top cause to the relevant source line.",
                        "A stack trace names the exception, provides a message, and lists method calls. "
                                + "First read the exception type and message. Then find the first line that "
                                + "belongs to your own code. The filename and line number identify where "
                                + "the failure appeared, although the original bad value may have been "
                                + "created earlier.",
                        "Exception in thread \"main\" java.lang.ArrayIndexOutOfBoundsException\n"
                                + "    at GradeApp.calculate(GradeApp.java:18)\n"
                                + "    at GradeApp.main(GradeApp.java:7)\n\n"
                                + "// Start investigating GradeApp.java line 18.",
                        "Read stack traces like a route map. The first relevant application line is "
                                + "the crash location; move backward if the corrupted data began earlier."),
                new LessonTopic(
                        "Troubleshooting Checklist",
                        "Use a practical checklist when a Java program does not run correctly.",
                        "Check that the JDK is installed and java and javac are available. Confirm the "
                                + "public class and filename match. Save all files and rebuild the project. "
                                + "Read the complete error, not only its first line. Verify input, array "
                                + "bounds, null references, loop conditions, operators, and data types. "
                                + "Reduce the problem to a small reproducible case. After a fix, test the "
                                + "normal case, boundary cases, and invalid input.",
                        "java -version\n"
                                + "javac -version\n\n"
                                + "// Frequent checks:\n"
                                + "object != null\n"
                                + "index >= 0 && index < array.length\n"
                                + "denominator != 0",
                        "End by emphasizing verification: one successful run does not prove that every "
                                + "input works."));
    }

    public static void main(String[] args) {
        ModuleTheme.install();
        SwingUtilities.invokeLater(() -> new RunDebugModule().setVisible(true));
    }
}
