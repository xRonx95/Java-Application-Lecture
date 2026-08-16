import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import javax.swing.table.DefaultTableModel;

/**
 * Demonstrates professional UPDATE and DELETE operations with JFrame and JDBC.
 */
public class StudentManagementFrame extends JFrame {
    private static final Color NAVY = new Color(13, 33, 56);
    private static final Color BLUE = new Color(37, 99, 168);
    private static final Color RED = new Color(169, 54, 54);
    private static final Color LIGHT_BACKGROUND = new Color(244, 247, 250);

    private final JTextField txtFullName = new JTextField(24);
    private final JTextField txtCourse = new JTextField(24);
    private final JTextField txtYearLevel = new JTextField(24);
    private final JTextField txtEmail = new JTextField(24);

    private final JButton btnUpdate = new JButton("Update Record");
    private final JButton btnDelete = new JButton("Delete Record");
    private final JButton btnClear = new JButton("Clear Form");

    private final DefaultTableModel tableModel = new DefaultTableModel(
            new Object[]{"ID", "Full Name", "Course", "Year Level", "Email"}, 0) {
        @Override
        public boolean isCellEditable(int row, int column) {
            return false;
        }
    };

    private final JTable studentTable = new JTable(tableModel);
    private final JLabel statusLabel = new JLabel("Ready");

    public StudentManagementFrame() {
        super("Student Record Management | JDBC Update and Delete");
        configureFrame();
        buildInterface();
        registerEvents();
        loadStudents();
    }

    private void configureFrame() {
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(980, 650));
        setSize(1120, 720);
        setLocationRelativeTo(null);
        getContentPane().setBackground(LIGHT_BACKGROUND);
    }

    private void buildInterface() {
        setLayout(new BorderLayout(18, 18));
        add(createHeaderPanel(), BorderLayout.NORTH);
        add(createFormPanel(), BorderLayout.WEST);
        add(createTablePanel(), BorderLayout.CENTER);
        add(createStatusPanel(), BorderLayout.SOUTH);
    }

    private JPanel createHeaderPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(NAVY);
        panel.setBorder(BorderFactory.createEmptyBorder(20, 26, 20, 26));

        JLabel title = new JLabel("Student Record Management");
        title.setForeground(Color.WHITE);
        title.setFont(new Font("SansSerif", Font.BOLD, 25));

        JLabel subtitle = new JLabel("Database and JDBC · UPDATE and DELETE Module");
        subtitle.setForeground(new Color(205, 220, 233));
        subtitle.setFont(new Font("SansSerif", Font.PLAIN, 14));

        panel.add(title, BorderLayout.NORTH);
        panel.add(subtitle, BorderLayout.SOUTH);
        return panel;
    }

    private JPanel createFormPanel() {
        JPanel outer = new JPanel(new BorderLayout());
        outer.setBackground(LIGHT_BACKGROUND);
        outer.setBorder(BorderFactory.createEmptyBorder(0, 20, 0, 0));
        outer.setPreferredSize(new Dimension(350, 0));

        JPanel form = new JPanel(new GridBagLayout());
        form.setBackground(Color.WHITE);
        form.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(214, 223, 232)),
                BorderFactory.createEmptyBorder(22, 22, 22, 22)));

        GridBagConstraints constraints = new GridBagConstraints();
        constraints.gridx = 0;
        constraints.weightx = 1;
        constraints.fill = GridBagConstraints.HORIZONTAL;
        constraints.insets = new Insets(5, 0, 5, 0);

        int row = 0;
        addFormTitle(form, constraints, row++);
        row = addFormField(form, constraints, row, "Full Name", txtFullName);
        row = addFormField(form, constraints, row, "Course", txtCourse);
        row = addFormField(form, constraints, row, "Year Level (1–5)", txtYearLevel);
        row = addFormField(form, constraints, row, "Email Address", txtEmail);

        constraints.gridy = row;
        constraints.insets = new Insets(20, 0, 0, 0);
        form.add(createButtonPanel(), constraints);

        outer.add(form, BorderLayout.NORTH);
        return outer;
    }

    private void addFormTitle(JPanel panel, GridBagConstraints constraints, int row) {
        JLabel title = new JLabel("Selected Student");
        title.setFont(new Font("SansSerif", Font.BOLD, 19));
        title.setForeground(NAVY);
        constraints.gridy = row;
        constraints.insets = new Insets(0, 0, 14, 0);
        panel.add(title, constraints);
    }

    private int addFormField(
            JPanel panel,
            GridBagConstraints constraints,
            int row,
            String labelText,
            JTextField field) {

        JLabel label = new JLabel(labelText);
        label.setFont(new Font("SansSerif", Font.BOLD, 13));
        label.setForeground(new Color(51, 65, 81));

        constraints.gridy = row++;
        constraints.insets = new Insets(6, 0, 3, 0);
        panel.add(label, constraints);

        field.setFont(new Font("SansSerif", Font.PLAIN, 15));
        field.setMargin(new Insets(7, 8, 7, 8));
        constraints.gridy = row++;
        constraints.insets = new Insets(0, 0, 8, 0);
        panel.add(field, constraints);
        return row;
    }

    private JPanel createButtonPanel() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBackground(Color.WHITE);

        styleButton(btnUpdate, BLUE, Color.WHITE);
        styleButton(btnDelete, RED, Color.WHITE);
        styleButton(btnClear, new Color(226, 232, 240), NAVY);

        btnUpdate.setEnabled(false);
        btnDelete.setEnabled(false);

        GridBagConstraints constraints = new GridBagConstraints();
        constraints.gridx = 0;
        constraints.weightx = 1;
        constraints.fill = GridBagConstraints.HORIZONTAL;
        constraints.insets = new Insets(4, 0, 4, 0);
        panel.add(btnUpdate, constraints);

        constraints.gridy = 1;
        panel.add(btnDelete, constraints);

        constraints.gridy = 2;
        panel.add(btnClear, constraints);
        return panel;
    }

    private void styleButton(JButton button, Color background, Color foreground) {
        button.setBackground(background);
        button.setForeground(foreground);
        button.setFont(new Font("SansSerif", Font.BOLD, 14));
        button.setFocusPainted(false);
        button.setBorder(BorderFactory.createEmptyBorder(11, 14, 11, 14));
        button.setOpaque(true);
    }

    private JPanel createTablePanel() {
        JPanel panel = new JPanel(new BorderLayout(0, 10));
        panel.setBackground(LIGHT_BACKGROUND);
        panel.setBorder(BorderFactory.createEmptyBorder(0, 0, 0, 20));

        JLabel instruction = new JLabel("Select a row to update or delete a student record.");
        instruction.setForeground(new Color(71, 85, 105));
        instruction.setFont(new Font("SansSerif", Font.PLAIN, 14));

        studentTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        studentTable.setRowHeight(30);
        studentTable.setFont(new Font("SansSerif", Font.PLAIN, 14));
        studentTable.getTableHeader().setFont(new Font("SansSerif", Font.BOLD, 14));
        studentTable.getTableHeader().setBackground(NAVY);
        studentTable.getTableHeader().setForeground(Color.WHITE);
        studentTable.setGridColor(new Color(226, 232, 240));

        JScrollPane scrollPane = new JScrollPane(studentTable);
        scrollPane.setBorder(BorderFactory.createLineBorder(new Color(203, 213, 225)));

        panel.add(instruction, BorderLayout.NORTH);
        panel.add(scrollPane, BorderLayout.CENTER);
        return panel;
    }

    private JPanel createStatusPanel() {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        panel.setBackground(new Color(238, 243, 247));
        panel.setBorder(BorderFactory.createEmptyBorder(4, 20, 4, 20));
        statusLabel.setForeground(new Color(71, 85, 105));
        statusLabel.setFont(new Font("SansSerif", Font.PLAIN, 13));
        panel.add(statusLabel);
        return panel;
    }

    private void registerEvents() {
        btnUpdate.addActionListener(event -> updateStudent());
        btnDelete.addActionListener(event -> deleteStudent());
        btnClear.addActionListener(event -> clearForm());

        studentTable.getSelectionModel().addListSelectionListener(event -> {
            if (!event.getValueIsAdjusting()) {
                populateFormFromSelectedRow();
            }
        });
    }

    private void populateFormFromSelectedRow() {
        int viewRow = studentTable.getSelectedRow();
        boolean hasSelection = viewRow >= 0;
        btnUpdate.setEnabled(hasSelection);
        btnDelete.setEnabled(hasSelection);

        if (!hasSelection) {
            return;
        }

        int modelRow = studentTable.convertRowIndexToModel(viewRow);
        txtFullName.setText(String.valueOf(tableModel.getValueAt(modelRow, 1)));
        txtCourse.setText(String.valueOf(tableModel.getValueAt(modelRow, 2)));
        txtYearLevel.setText(String.valueOf(tableModel.getValueAt(modelRow, 3)));
        txtEmail.setText(String.valueOf(tableModel.getValueAt(modelRow, 4)));
        statusLabel.setText("Selected student ID: " + tableModel.getValueAt(modelRow, 0));
    }

    private Integer getSelectedStudentId() {
        int viewRow = studentTable.getSelectedRow();
        if (viewRow < 0) {
            return null;
        }

        int modelRow = studentTable.convertRowIndexToModel(viewRow);
        Object idValue = tableModel.getValueAt(modelRow, 0);
        return Integer.valueOf(String.valueOf(idValue));
    }

    private boolean validateForm() {
        String fullName = txtFullName.getText().trim();
        String course = txtCourse.getText().trim();
        String yearText = txtYearLevel.getText().trim();
        String email = txtEmail.getText().trim();

        if (fullName.isEmpty() || course.isEmpty() || yearText.isEmpty() || email.isEmpty()) {
            JOptionPane.showMessageDialog(
                    this,
                    "Complete all fields before updating the record.",
                    "Incomplete Information",
                    JOptionPane.WARNING_MESSAGE);
            return false;
        }

        int yearLevel;
        try {
            yearLevel = Integer.parseInt(yearText);
        } catch (NumberFormatException exception) {
            JOptionPane.showMessageDialog(
                    this,
                    "Year level must be a whole number from 1 to 5.",
                    "Invalid Year Level",
                    JOptionPane.WARNING_MESSAGE);
            return false;
        }

        if (yearLevel < 1 || yearLevel > 5) {
            JOptionPane.showMessageDialog(
                    this,
                    "Year level must be between 1 and 5.",
                    "Invalid Year Level",
                    JOptionPane.WARNING_MESSAGE);
            return false;
        }

        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            JOptionPane.showMessageDialog(
                    this,
                    "Enter a valid email address.",
                    "Invalid Email",
                    JOptionPane.WARNING_MESSAGE);
            return false;
        }

        return true;
    }

    private void updateStudent() {
        Integer studentId = getSelectedStudentId();
        if (studentId == null) {
            JOptionPane.showMessageDialog(this, "Select a student record first.");
            return;
        }

        if (!validateForm()) {
            return;
        }

        String sql = "UPDATE students "
                + "SET full_name = ?, course = ?, year_level = ?, email = ? "
                + "WHERE student_id = ?";

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, txtFullName.getText().trim());
            statement.setString(2, txtCourse.getText().trim());
            statement.setInt(3, Integer.parseInt(txtYearLevel.getText().trim()));
            statement.setString(4, txtEmail.getText().trim());
            statement.setInt(5, studentId);

            int affectedRows = statement.executeUpdate();
            if (affectedRows == 1) {
                JOptionPane.showMessageDialog(
                        this,
                        "Student record updated successfully.",
                        "Update Complete",
                        JOptionPane.INFORMATION_MESSAGE);
                loadStudents();
                clearForm();
            } else {
                JOptionPane.showMessageDialog(
                        this,
                        "No matching record was updated. Refresh and try again.",
                        "Record Not Found",
                        JOptionPane.WARNING_MESSAGE);
            }
        } catch (SQLException exception) {
            showDatabaseError("Unable to update the record.", exception);
        }
    }

    private void deleteStudent() {
        Integer studentId = getSelectedStudentId();
        if (studentId == null) {
            JOptionPane.showMessageDialog(this, "Select a student record first.");
            return;
        }

        int choice = JOptionPane.showConfirmDialog(
                this,
                "Permanently delete student ID " + studentId + "?",
                "Confirm Record Deletion",
                JOptionPane.YES_NO_OPTION,
                JOptionPane.WARNING_MESSAGE);

        if (choice != JOptionPane.YES_OPTION) {
            statusLabel.setText("Deletion cancelled.");
            return;
        }

        String sql = "DELETE FROM students WHERE student_id = ?";
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setInt(1, studentId);
            int affectedRows = statement.executeUpdate();

            if (affectedRows == 1) {
                JOptionPane.showMessageDialog(
                        this,
                        "Student record deleted successfully.",
                        "Deletion Complete",
                        JOptionPane.INFORMATION_MESSAGE);
                loadStudents();
                clearForm();
            } else {
                JOptionPane.showMessageDialog(
                        this,
                        "The selected record no longer exists.",
                        "Record Not Found",
                        JOptionPane.WARNING_MESSAGE);
            }
        } catch (SQLException exception) {
            showDatabaseError("Unable to delete the record.", exception);
        }
    }

    private void loadStudents() {
        tableModel.setRowCount(0);
        String sql = "SELECT student_id, full_name, course, year_level, email "
                + "FROM students ORDER BY student_id";

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet result = statement.executeQuery()) {

            while (result.next()) {
                tableModel.addRow(new Object[]{
                    result.getInt("student_id"),
                    result.getString("full_name"),
                    result.getString("course"),
                    result.getInt("year_level"),
                    result.getString("email")
                });
            }

            statusLabel.setText(tableModel.getRowCount() + " student record(s) loaded.");
        } catch (SQLException exception) {
            showDatabaseError("Unable to load student records.", exception);
        }
    }

    private void clearForm() {
        studentTable.clearSelection();
        txtFullName.setText("");
        txtCourse.setText("");
        txtYearLevel.setText("");
        txtEmail.setText("");
        btnUpdate.setEnabled(false);
        btnDelete.setEnabled(false);
        statusLabel.setText("Ready");
        txtFullName.requestFocusInWindow();
    }

    private void showDatabaseError(String userMessage, SQLException exception) {
        statusLabel.setText("Database operation failed.");
        JOptionPane.showMessageDialog(
                this,
                userMessage + "\n\nTechnical detail: " + exception.getMessage(),
                "Database Error",
                JOptionPane.ERROR_MESSAGE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception ignored) {
                // Continue with the default cross-platform appearance.
            }

            new StudentManagementFrame().setVisible(true);
        });
    }
}
