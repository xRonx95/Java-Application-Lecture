package studentapp;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridLayout;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;
import javax.swing.border.EmptyBorder;

public class StudentRegistrationApp extends JFrame {
    private final JTextField nameField = new JTextField(20);
    private final JTextField emailField = new JTextField(20);
    private final JComboBox<String> courseBox = new JComboBox<>(new String[]{
        "BS Information Technology",
        "BS Computer Science",
        "BS Information Systems"
    });
    private final JTextArea resultArea = new JTextArea(6, 24);

    public StudentRegistrationApp() {
        setTitle("Student Registration App");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(560, 480));

        JPanel root = new JPanel(new BorderLayout(16, 16));
        root.setBorder(new EmptyBorder(24, 24, 24, 24));

        JLabel title = new JLabel("Student Registration");
        title.setFont(new Font("SansSerif", Font.BOLD, 24));
        root.add(title, BorderLayout.NORTH);

        JPanel form = new JPanel(new GridLayout(3, 2, 12, 12));
        form.add(new JLabel("Complete name:"));
        form.add(nameField);
        form.add(new JLabel("Email address:"));
        form.add(emailField);
        form.add(new JLabel("Course:"));
        form.add(courseBox);

        resultArea.setEditable(false);
        resultArea.setLineWrap(true);
        resultArea.setWrapStyleWord(true);

        JButton saveButton = new JButton("Save Student");
        JButton clearButton = new JButton("Clear Form");
        saveButton.addActionListener(event -> saveStudent());
        clearButton.addActionListener(event -> clearForm());

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        actions.add(clearButton);
        actions.add(saveButton);

        JPanel center = new JPanel(new BorderLayout(12, 12));
        center.add(form, BorderLayout.NORTH);
        center.add(new JScrollPane(resultArea), BorderLayout.CENTER);
        center.add(actions, BorderLayout.SOUTH);
        root.add(center, BorderLayout.CENTER);

        setContentPane(root);
        pack();
        setLocationRelativeTo(null);
    }

    private void saveStudent() {
        String name = nameField.getText().trim();
        String email = emailField.getText().trim();
        String course = (String) courseBox.getSelectedItem();

        if (name.isEmpty() || email.isEmpty()) {
            JOptionPane.showMessageDialog(
                this,
                "Name and email are required.",
                "Validation Error",
                JOptionPane.WARNING_MESSAGE
            );
            return;
        }

        resultArea.setText(
            "REGISTRATION SUMMARY\n\n"
            + "Name: " + name + "\n"
            + "Email: " + email + "\n"
            + "Course: " + course
        );
    }

    private void clearForm() {
        nameField.setText("");
        emailField.setText("");
        courseBox.setSelectedIndex(0);
        resultArea.setText("");
        nameField.requestFocus();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new StudentRegistrationApp().setVisible(true);
        });
    }
}
