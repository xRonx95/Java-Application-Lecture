package lessonmodule;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;

public class PackagesClassesFrame extends JFrame {

    private static final Color MAROON = new Color(109, 22, 57);
    private static final Color GOLD = new Color(233, 185, 73);
    private static final Color BACKGROUND = new Color(247, 244, 246);

    private final JTextField nameField = new JTextField(20);
    private final JTextField courseField = new JTextField(20);
    private final JLabel outputLabel = new JLabel(
            "Enter your information, then click Create Object.",
            SwingConstants.CENTER
    );

    public PackagesClassesFrame() {
        setTitle("Java Packages and Classes Lesson");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(560, 430));
        setLocationByPlatform(true);
        setLayout(new BorderLayout());

        add(createHeader(), BorderLayout.NORTH);
        add(createFormPanel(), BorderLayout.CENTER);

        pack();
        setLocationRelativeTo(null);
    }

    private JPanel createHeader() {
        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(MAROON);
        header.setBorder(BorderFactory.createEmptyBorder(24, 28, 24, 28));

        JLabel title = new JLabel("Packages and Classes");
        title.setForeground(Color.WHITE);
        title.setFont(new Font("Serif", Font.BOLD, 28));

        JLabel subtitle = new JLabel("Java Swing • Apache NetBeans");
        subtitle.setForeground(GOLD);
        subtitle.setFont(new Font("SansSerif", Font.PLAIN, 14));

        header.add(title, BorderLayout.CENTER);
        header.add(subtitle, BorderLayout.SOUTH);
        return header;
    }

    private JPanel createFormPanel() {
        JPanel outerPanel = new JPanel(new GridBagLayout());
        outerPanel.setBackground(BACKGROUND);
        outerPanel.setBorder(BorderFactory.createEmptyBorder(25, 25, 25, 25));

        JPanel formPanel = new JPanel(new GridBagLayout());
        formPanel.setBackground(Color.WHITE);
        formPanel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(225, 215, 220)),
                BorderFactory.createEmptyBorder(24, 28, 24, 28)
        ));

        GridBagConstraints grid = new GridBagConstraints();
        grid.fill = GridBagConstraints.HORIZONTAL;
        grid.insets = new Insets(7, 7, 7, 7);

        grid.gridx = 0;
        grid.gridy = 0;
        formPanel.add(new JLabel("Student name:"), grid);

        grid.gridx = 1;
        grid.weightx = 1;
        formPanel.add(nameField, grid);

        grid.gridx = 0;
        grid.gridy = 1;
        grid.weightx = 0;
        formPanel.add(new JLabel("Course:"), grid);

        grid.gridx = 1;
        grid.weightx = 1;
        formPanel.add(courseField, grid);

        JButton createButton = new JButton("Create Object");
        createButton.setBackground(MAROON);
        createButton.setForeground(Color.WHITE);
        createButton.setFocusPainted(false);
        createButton.addActionListener(event -> createStudentObject());

        JButton clearButton = new JButton("Clear");
        clearButton.addActionListener(event -> clearForm());

        JPanel buttons = new JPanel();
        buttons.setBackground(Color.WHITE);
        buttons.add(createButton);
        buttons.add(clearButton);

        grid.gridx = 0;
        grid.gridy = 2;
        grid.gridwidth = 2;
        grid.weightx = 1;
        formPanel.add(buttons, grid);

        outputLabel.setOpaque(true);
        outputLabel.setBackground(new Color(255, 249, 232));
        outputLabel.setBorder(BorderFactory.createEmptyBorder(15, 12, 15, 12));

        grid.gridy = 3;
        grid.insets = new Insets(15, 7, 7, 7);
        formPanel.add(outputLabel, grid);

        outerPanel.add(formPanel);
        return outerPanel;
    }

    private void createStudentObject() {
        String name = nameField.getText().trim();
        String course = courseField.getText().trim();

        if (name.isEmpty() || course.isEmpty()) {
            JOptionPane.showMessageDialog(
                    this,
                    "Please enter both the student name and course.",
                    "Missing Information",
                    JOptionPane.WARNING_MESSAGE
            );
            return;
        }

        Student student = new Student(name, course);
        outputLabel.setText(student.introduce());
    }

    private void clearForm() {
        nameField.setText("");
        courseField.setText("");
        outputLabel.setText("Enter your information, then click Create Object.");
        nameField.requestFocusInWindow();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception ignored) {
                // Continue using Java's default cross-platform look and feel.
            }
            new PackagesClassesFrame().setVisible(true);
        });
    }
}

class Student {
    private final String name;
    private final String course;

    Student(String name, String course) {
        this.name = name;
        this.course = course;
    }

    String introduce() {
        return "Hello! I am " + name + " from " + course + ".";
    }
}
