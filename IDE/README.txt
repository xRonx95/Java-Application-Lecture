JAVA JFRAME PRACTICE IDE - MULTI-FORM VERSION

Folder structure:

site/
├── index.html
├── img/favicon.jpg
└── IDE/
    ├── index.html
    ├── css/ide.css
    ├── js/ide.js
    └── api/test-db.php

NEW IN THIS VERSION
- Multiple JFrame forms inside one project.
- Create LoginForm.java, DashboardForm.java, StudentForm.java, etc.
- Each JFrame has its own Design canvas and component list.
- Create source-only Java classes.
- Built-in Blank, Login, Dashboard, and Data Entry form templates.
- Set any Java file as the Main class.
- Delete files from the practice project.
- JButton property can open another designed JFrame.
- Preview supports navigation between designed JFrame forms.
- Older v2 localStorage projects are migrated to v3 when possible.

IMPORTANT ABOUT XAMPP
The database tester uses PHP. VS Code Live Server at 127.0.0.1:5500 does NOT execute PHP.
For Test XAMPP Database, put the site under htdocs and open it through Apache, e.g.:
http://localhost/your-project/IDE/

IMPORTANT ABOUT JAVA
A normal web browser cannot run javac or Swing directly. Compile performs source checks and Run displays an interactive browser preview. Generated .java files are designed for use with a real JDK / Apache NetBeans.


PROFESSIONAL MOBILE RESPONSIVE
------------------------------
On screens 900px wide and below the IDE uses a mobile workspace switcher:
- Files: Projects / Files + Swing Palette
- Designer: Design and Source workspace
- Properties: JFrame, component, and database properties
- Output: full-height output console

The JFrame design keeps its real desktop pixel dimensions and scrolls horizontally/vertically on phones so generated Swing bounds remain accurate. Touch controls and resize handles are enlarged on coarse-pointer devices.


AUTHENTICATION UPDATE
---------------------
New features:
- Delete button beside every project file
- Delete Selected File toolbar action
- Login Form - MySQL Database JFrame template
- Register / Signup - MySQL Database JFrame template
- DBConnection.java generator
- PasswordUtil.java using PBKDF2WithHmacSHA256
- database_setup.sql generator
- JDBC login with PreparedStatement
- JDBC registration with duplicate username/email checking
- Password confirmation and minimum 8-character validation

Real NetBeans/JDK setup:
1. Run database_setup.sql in phpMyAdmin or MySQL.
2. Add MySQL Connector/J to the NetBeans project Libraries.
3. Check DBConnection.java for the correct database credentials.
4. Run RegisterForm.java first to create an account.
5. Run LoginForm.java and authenticate using the account stored in MySQL.

The browser preview does not execute JDBC. Generated Java code does when run with a JDK.
For the browser-side "Test XAMPP Database" button, open the website through XAMPP Apache,
not VS Code Live Server on port 5500.


QUICK AUTHENTICATION PRACTICE
-----------------------------
1. In the IDE choose + New File / JFrame.
2. Choose "Login Form - MySQL Database" or "Register / Signup - MySQL Database".
3. The IDE creates/uses:
   - DBConnection.java
   - PasswordUtil.java
   - database_setup.sql
4. Import sql/auth_database.sql (or the generated database_setup.sql) in phpMyAdmin.
5. Add MySQL Connector/J to the actual Apache NetBeans Java project.
6. Register an account first, then test LoginForm.
7. Use "Open JFrame on Button Click" to send a successful login to DashboardForm.

Passwords are not stored as plain text. PasswordUtil.java uses PBKDF2WithHmacSHA256.


PROFESSIONAL DASHBOARD JFRAME TEMPLATE
--------------------------------------
Use + New File / JFrame > JFrame Form > Dashboard - Professional JFrame.
The default class is DashboardForm and the default title is System Dashboard.
The template includes summary areas, Student Management, Records, Reports,
User Accounts, Settings, and Logout buttons. The IDE automatically links
common forms when StudentForm, RecordsForm, ReportForm/ReportsForm,
UserForm/UsersForm, SettingsForm, and LoginForm exist in the same project.
You can also select any dashboard JButton and change Open JFrame on Button
Click from Component Properties.


NETBEANS-STYLE EVENT UPDATE
- Double-click any JButton on the Design canvas to switch to Source.
- The IDE generates a method such as btnLoginActionPerformed(java.awt.event.ActionEvent evt).
- Component Properties now includes an Events section with Open / Create Action Handler.
- Login/Register buttons use generated ActionPerformed handlers that call the JDBC authentication methods.
- Navigation buttons use generated ActionPerformed handlers to open their assigned JFrame.
- Manual edits inside generated ActionPerformed bodies are preserved when the form source is regenerated, when possible.

This is a browser-based teaching IDE that imitates important NetBeans workflows. It is not Apache NetBeans itself and cannot provide the complete Java compiler/debugger/refactoring stack without a server-side Java runtime or desktop integration.

CODE FOLDING UPDATE
-------------------
The Source editor now includes NetBeans-style folding controls:
- Code Folding: switches between the normal editable textarea and a collapsible source view.
- Minimize Generated: collapses imports, class/field declarations, constructor/UI setup, and main method while keeping ActionPerformed and database/helper methods visible.
- Maximize All: expands all sections.
- Edit: shown on each folded section; opens the full editable source and selects that section.

Double-clicking a JButton in Design still opens its ActionPerformed handler in the normal editable source editor.
