import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Centralizes the JDBC configuration used by the lesson application.
 * Update USER and PASSWORD to match the local MySQL installation.
 */
public final class DatabaseConnection {
    private static final String URL =
            "jdbc:mysql://localhost:3306/school_db"
            + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String USER = "root";
    private static final String PASSWORD = "";

    private DatabaseConnection() {
        // Utility class: prevent object creation.
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
