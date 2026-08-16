import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridLayout;

public class JFrameLessonApp extends JFrame {

    private final JLabel statusLabel;
    private int clickCount = 0;

    public JFrameLessonApp() {
        setTitle("Executable JAR Demo");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(520, 340));

        JPanel header = new JPanel(new GridLayout(2, 1, 0, 5));
        header.setBackground(new Color(31, 41, 55));
        header.setBorder(BorderFactory.createEmptyBorder(28, 30, 24, 30));

        JLabel title = new JLabel("JFrame JAR Application", SwingConstants.CENTER);
        title.setForeground(Color.WHITE);
        title.setFont(new Font("SansSerif", Font.BOLD, 25));

        JLabel subtitle = new JLabel(
                "This window is running from compiled Java code.",
                SwingConstants.CENTER
        );
        subtitle.setForeground(new Color(209, 213, 219));

        header.add(title);
        header.add(subtitle);

        JPanel center = new JPanel(new BorderLayout(0, 20));
        center.setBorder(BorderFactory.createEmptyBorder(38, 55, 38, 55));

        statusLabel = new JLabel("Click the button to test the application.", SwingConstants.CENTER);
        statusLabel.setFont(new Font("SansSerif", Font.PLAIN, 16));

        JButton actionButton = new JButton("Run Action");
        actionButton.setFont(new Font("SansSerif", Font.BOLD, 15));
        actionButton.setFocusPainted(false);
        actionButton.addActionListener(event -> updateStatus());

        center.add(statusLabel, BorderLayout.CENTER);
        center.add(actionButton, BorderLayout.SOUTH);

        add(header, BorderLayout.NORTH);
        add(center, BorderLayout.CENTER);
        pack();
        setLocationRelativeTo(null);
    }

    private void updateStatus() {
        clickCount++;
        statusLabel.setText("Success! Button clicked " + clickCount + " time(s).");
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrameLessonApp app = new JFrameLessonApp();
            app.setVisible(true);
        });
    }
}