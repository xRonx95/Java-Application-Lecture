import javax.swing.*;
import javax.swing.border.Border;
import javax.swing.border.EmptyBorder;
import javax.swing.plaf.FontUIResource;
import java.awt.*;
import java.util.Enumeration;

/** Centralized visual styling for the Run and Debug lesson application. */
public final class ModuleTheme {
    public static final Color PRIMARY = new Color(88, 20, 45);
    public static final Color PRIMARY_DARK = new Color(58, 12, 30);
    public static final Color ACCENT = new Color(218, 165, 32);
    public static final Color BACKGROUND = new Color(246, 247, 250);
    public static final Color SURFACE = Color.WHITE;
    public static final Color TEXT = new Color(34, 38, 45);
    public static final Color MUTED = new Color(95, 103, 115);
    public static final Color SUCCESS = new Color(34, 139, 94);
    public static final Color DANGER = new Color(190, 55, 65);
    public static final Color CODE_BG = new Color(31, 35, 42);

    private ModuleTheme() {}

    public static void install() {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception ignored) {
            // The program still works with Java's default look and feel.
        }

        FontUIResource defaultFont = new FontUIResource("SansSerif", Font.PLAIN, 14);
        Enumeration<Object> keys = UIManager.getDefaults().keys();
        while (keys.hasMoreElements()) {
            Object key = keys.nextElement();
            if (UIManager.get(key) instanceof FontUIResource) {
                UIManager.put(key, defaultFont);
            }
        }

        UIManager.put("OptionPane.background", SURFACE);
        UIManager.put("Panel.background", SURFACE);
        UIManager.put("ProgressBar.foreground", ACCENT);
        UIManager.put("ProgressBar.selectionForeground", PRIMARY_DARK);
        UIManager.put("ProgressBar.selectionBackground", PRIMARY_DARK);
    }

    public static JButton primaryButton(String text) {
        JButton button = new JButton(text);
        button.setFont(new Font("SansSerif", Font.BOLD, 14));
        button.setForeground(Color.WHITE);
        button.setBackground(PRIMARY);
        button.setFocusPainted(false);
        button.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        button.setBorder(new EmptyBorder(10, 18, 10, 18));
        return button;
    }

    public static JButton secondaryButton(String text) {
        JButton button = primaryButton(text);
        button.setForeground(PRIMARY);
        button.setBackground(new Color(244, 232, 237));
        return button;
    }

    public static Border cardBorder() {
        return BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(224, 226, 232)),
                new EmptyBorder(18, 20, 18, 20)
        );
    }

    public static JTextArea codeArea(String code) {
        JTextArea area = new JTextArea(code);
        area.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 14));
        area.setForeground(new Color(231, 235, 241));
        area.setBackground(CODE_BG);
        area.setCaretColor(Color.WHITE);
        area.setEditable(false);
        area.setLineWrap(false);
        area.setTabSize(4);
        area.setBorder(new EmptyBorder(14, 16, 14, 16));
        return area;
    }
}
