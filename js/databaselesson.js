(() => {
  "use strict";

  const menuButton = document.querySelector(".menu-button");
  const primaryNavigation = document.getElementById("primary-navigation");
  const modal = document.getElementById("javaDemoModal");
  const modalBody = document.getElementById("javaDemoBody");
  const modalTitle = document.getElementById("javaDemoTitle");
  const modalSubtitle = document.getElementById("javaDemoSubtitle");

  let lastFocusedElement = null;
  let demoState = [];

  const baseStudents = () => [
    {
      student_id: 1,
      full_name: "Ana Reyes",
      course: "BS Information Technology",
      year_level: 2,
      email: "ana.reyes@example.edu"
    },
    {
      student_id: 2,
      full_name: "Marco Santos",
      course: "BS Computer Science",
      year_level: 3,
      email: "marco.santos@example.edu"
    }
  ];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  function setMenu(open) {
    if (!menuButton || !primaryNavigation) {
      return;
    }

    menuButton.setAttribute("aria-expanded", String(open));
    primaryNavigation.classList.toggle("is-open", open);
  }

  if (menuButton && primaryNavigation) {
    menuButton.addEventListener("click", () => {
      const open =
        menuButton.getAttribute("aria-expanded") !== "true";

      setMenu(open);
    });

    primaryNavigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setMenu(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        setMenu(false);
      }
    });
  }

  /* =========================================================
     COPY CODE BUTTONS
     ========================================================= */

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    document.execCommand("copy");

    textarea.remove();
  }

  document
    .querySelectorAll("[data-copy-target]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const target = document.getElementById(
          button.dataset.copyTarget
        );

        if (!target) {
          return;
        }

        const originalText = button.textContent;

        try {
          await copyText(target.innerText);

          button.textContent = "Copied!";
          button.classList.add("copied");
        } catch (error) {
          button.textContent = "Copy failed";
        }

        window.setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("copied");
        }, 1400);
      });
    });

  /* =========================================================
     GUI DEMO HELPERS
     ========================================================= */

  function infoStrip(text) {
    return `
      <div class="demo-info-strip">
        <span class="demo-info-icon" aria-hidden="true">i</span>

        <div>
          <strong>Expected result simulation.</strong>
          ${escapeHtml(text)}
        </div>
      </div>
    `;
  }

  function windowShell(
    title,
    body,
    status = "Ready"
  ) {
    return `
      <div class="swing-window">

        <div class="swing-window-bar">

          <div class="swing-window-title">
            <span class="swing-java-icon">J</span>
            <span>${escapeHtml(title)}</span>
          </div>

          <div
            class="swing-window-controls"
            aria-hidden="true"
          >
            <span>—</span>
            <span>□</span>
            <span>×</span>
          </div>

        </div>

        ${body}

        <div class="swing-statusbar">

          <span
            class="swing-status info"
            id="demoStatus"
          >
            ${escapeHtml(status)}
          </span>

          <span>
            Java Swing / JDBC classroom simulation
          </span>

        </div>

      </div>
    `;
  }

  function messageBox(
    message,
    type = "success",
    title = "Message"
  ) {
    let icon = "i";

    if (type === "warning") {
      icon = "!";
    }

    if (type === "success") {
      icon = "✓";
    }

    return `
      <div class="swing-message ${type}">

        <div class="swing-message-title">
          ${escapeHtml(title)}
        </div>

        <div class="swing-message-body">

          <span
            class="swing-message-icon"
            aria-hidden="true"
          >
            ${icon}
          </span>

          <p>
            ${escapeHtml(message)}
          </p>

        </div>

        <div class="swing-message-actions">

          <button
            class="swing-button"
            type="button"
            data-message-ok
          >
            OK
          </button>

        </div>

      </div>
    `;
  }

  /* =========================================================
     MAVEN DEMO
     ========================================================= */

  function renderMaven() {
    modalTitle.textContent = "Maven Dependency";

    modalSubtitle.textContent =
      "Expected NetBeans project configuration";

    modalBody.innerHTML =
      infoStrip(
        "This demonstrates what the project looks like after MySQL Connector/J has been added successfully."
      ) +
      `
      <div class="demo-project">

        <aside
          class="demo-project-tree"
          aria-label="Simulated NetBeans project tree"
        >

          <strong>Projects</strong>

          <div class="demo-tree-item">
            ▾ JdbcUpdateDeleteLesson
          </div>

          <div class="demo-tree-item indent">
            ▸ Source Packages
          </div>

          <div class="demo-tree-item indent">
            ▸ Test Packages
          </div>

          <div class="demo-tree-item indent active">
            ▾ Dependencies
          </div>

          <div class="demo-tree-item indent">
            ☕ mysql-connector-j
          </div>

        </aside>

        <div class="demo-project-main">

          <div class="demo-dependency-card">

            <h3>Project Dependencies</h3>

            <p>
              The JDBC driver is available to the Java
              application.
            </p>

            <div class="demo-dependency-row">

              <code>
                com.mysql:mysql-connector-j
              </code>

              <span class="demo-ready">
                READY
              </span>

            </div>

            <div class="demo-dependency-row">

              <code>
                Java Platform / JDK 17+
              </code>

              <span class="demo-ready">
                READY
              </span>

            </div>

          </div>

        </div>

      </div>
    `;
  }

  /* =========================================================
     SQL DATABASE DEMO
     ========================================================= */

  function renderSchema() {
    modalTitle.textContent = "Database Setup";

    modalSubtitle.textContent =
      "Expected SQL execution and sample records";

    modalBody.innerHTML =
      infoStrip(
        "The SQL below is represented as if it were executed successfully in a local MySQL classroom database."
      ) +
      `
      <div class="demo-sql-grid">

        <div class="demo-console">

          <div class="demo-console-title">
            MySQL Output
          </div>

          <pre><span class="console-info">mysql&gt;</span> CREATE DATABASE IF NOT EXISTS school_db;
<span class="console-success">Query OK, 1 row affected</span>

<span class="console-info">mysql&gt;</span> USE school_db;
Database changed

<span class="console-info">mysql&gt;</span> CREATE TABLE IF NOT EXISTS students (...);
<span class="console-success">Query OK, 0 rows affected</span>

<span class="console-info">mysql&gt;</span> INSERT INTO students (...);
<span class="console-success">Query OK, 2 rows affected</span>

2 records ready for the Java JFrame.</pre>

        </div>

        <div class="swing-panel">

          <p class="swing-panel-title">
            students table
          </p>

          ${tableMarkup(baseStudents(), null)}

        </div>

      </div>
    `;
  }

  /* =========================================================
     TABLE
     ========================================================= */

  function tableMarkup(students, selectedId) {
    if (!students.length) {
      return `
        <div class="demo-empty">
          No student records are currently available.
        </div>
      `;
    }

    const rows = students
      .map(
        (student) => `
        <tr
          data-student-id="${student.student_id}"
          class="${
            student.student_id === selectedId
              ? "is-selected"
              : ""
          }"
        >
          <td>${student.student_id}</td>

          <td>
            ${escapeHtml(student.full_name)}
          </td>

          <td>
            ${escapeHtml(student.course)}
          </td>

          <td>
            ${student.year_level}
          </td>

          <td>
            ${escapeHtml(student.email)}
          </td>

        </tr>
      `
      )
      .join("");

    return `
      <div class="swing-table-wrap">

        <table class="swing-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Course</th>
              <th>Year</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>

        </table>

      </div>
    `;
  }

  /* =========================================================
     STUDENT MANAGEMENT GUI
     ========================================================= */

  function studentManagerBody(
    selectedId = 1,
    suggestedYear = null
  ) {
    const selected =
      demoState.find(
        (student) =>
          student.student_id === selectedId
      ) ||
      demoState[0] || {
        student_id: "",
        full_name: "",
        course: "",
        year_level: "",
        email: ""
      };

    const yearValue =
      suggestedYear ?? selected.year_level;

    return `
      <div class="swing-app-body">

        <div class="swing-manager-layout">

          <section class="swing-panel">

            <p class="swing-panel-title">
              Student Information
            </p>

            <form
              class="swing-form"
              id="demoStudentForm"
            >

              <div class="swing-form-row">

                <label for="demoStudentId">
                  Student ID
                </label>

                <input
                  id="demoStudentId"
                  value="${escapeHtml(
                    selected.student_id
                  )}"
                  readonly
                >

              </div>

              <div class="swing-form-row">

                <label for="demoFullName">
                  Full Name
                </label>

                <input
                  id="demoFullName"
                  value="${escapeHtml(
                    selected.full_name
                  )}"
                >

              </div>

              <div class="swing-form-row">

                <label for="demoCourse">
                  Course
                </label>

                <input
                  id="demoCourse"
                  value="${escapeHtml(
                    selected.course
                  )}"
                >

              </div>

              <div class="swing-form-row">

                <label for="demoYear">
                  Year Level
                </label>

                <input
                  id="demoYear"
                  inputmode="numeric"
                  value="${escapeHtml(yearValue)}"
                >

              </div>

              <div class="swing-form-row">

                <label for="demoEmail">
                  Email
                </label>

                <input
                  id="demoEmail"
                  type="email"
                  value="${escapeHtml(
                    selected.email
                  )}"
                >

              </div>

              <div class="swing-button-row">

                <button
                  class="swing-button primary"
                  type="button"
                  id="demoUpdateButton"
                >
                  UPDATE
                </button>

                <button
                  class="swing-button danger"
                  type="button"
                  id="demoDeleteButton"
                >
                  DELETE
                </button>

                <button
                  class="swing-button"
                  type="button"
                  id="demoClearButton"
                >
                  CLEAR
                </button>

                <button
                  class="swing-button"
                  type="button"
                  id="demoReloadButton"
                >
                  REFRESH
                </button>

              </div>

            </form>

          </section>

          <section class="swing-panel">

            <p class="swing-panel-title">
              Student Records (JTable)
            </p>

            <div id="demoTableHost">
              ${tableMarkup(
                demoState,
                selected.student_id || null
              )}
            </div>

            <div id="demoMessageHost"></div>

          </section>

        </div>

      </div>
    `;
  }

  /* =========================================================
     GET FORM VALUES
     ========================================================= */

  function getFormValues() {
    return {
      student_id: Number(
        document.getElementById(
          "demoStudentId"
        )?.value || 0
      ),

      full_name:
        document
          .getElementById("demoFullName")
          ?.value.trim() || "",

      course:
        document
          .getElementById("demoCourse")
          ?.value.trim() || "",

      year_level: Number(
        document.getElementById(
          "demoYear"
        )?.value || 0
      ),

      email:
        document
          .getElementById("demoEmail")
          ?.value.trim() || ""
    };
  }

  /* =========================================================
     STATUS BAR
     ========================================================= */

  function setStatus(
    message,
    type = "info"
  ) {
    const status =
      document.getElementById("demoStatus");

    if (!status) {
      return;
    }

    status.textContent = message;

    status.className =
      `swing-status ${type}`;
  }

  /* =========================================================
     REFRESH TABLE
     ========================================================= */

  function refreshTable(
    selectedId = null
  ) {
    const host =
      document.getElementById(
        "demoTableHost"
      );

    if (host) {
      host.innerHTML =
        tableMarkup(
          demoState,
          selectedId
        );

      bindTableRows();
    }
  }

  /* =========================================================
     SELECT TABLE ROW
     ========================================================= */

  function fillForm(student) {
    if (!student) {
      return;
    }

    document.getElementById(
      "demoStudentId"
    ).value = student.student_id;

    document.getElementById(
      "demoFullName"
    ).value = student.full_name;

    document.getElementById(
      "demoCourse"
    ).value = student.course;

    document.getElementById(
      "demoYear"
    ).value = student.year_level;

    document.getElementById(
      "demoEmail"
    ).value = student.email;

    refreshTable(student.student_id);

    setStatus(
      `Selected student ID ${student.student_id}.`,
      "info"
    );
  }

  /* =========================================================
     CLEAR FORM
     ========================================================= */

  function clearForm() {
    [
      "demoStudentId",
      "demoFullName",
      "demoCourse",
      "demoYear",
      "demoEmail"
    ].forEach((id) => {
      const field =
        document.getElementById(id);

      if (field) {
        field.value = "";
      }
    });

    refreshTable(null);

    setStatus(
      "Form cleared.",
      "info"
    );
  }

  /* =========================================================
     TABLE ROW EVENTS
     ========================================================= */

  function bindTableRows() {
    document
      .querySelectorAll(
        "#demoTableHost [data-student-id]"
      )
      .forEach((row) => {
        row.addEventListener(
          "click",
          () => {
            const id = Number(
              row.dataset.studentId
            );

            const student =
              demoState.find(
                (item) =>
                  item.student_id === id
              );

            fillForm(student);
          }
        );
      });
  }

  /* =========================================================
     MESSAGE DIALOG
     ========================================================= */

  function showMessage(
    message,
    type = "success",
    title = "Message"
  ) {
    const host =
      document.getElementById(
        "demoMessageHost"
      );

    if (!host) {
      return;
    }

    host.innerHTML =
      messageBox(
        message,
        type,
        title
      );

    host
      .querySelector(
        "[data-message-ok]"
      )
      ?.addEventListener(
        "click",
        () => {
          host.innerHTML = "";
        }
      );
  }

  /* =========================================================
     VALIDATION
     ========================================================= */

  function validateStudent(values) {
    if (!values.student_id) {
      return "Select a student record first.";
    }

    if (
      !values.full_name ||
      !values.course ||
      !values.email
    ) {
      return "Complete all required fields.";
    }

    if (
      !Number.isInteger(
        values.year_level
      ) ||
      values.year_level < 1 ||
      values.year_level > 6
    ) {
      return "Year level must be a whole number from 1 to 6.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        values.email
      )
    ) {
      return "Enter a valid email address.";
    }

    return "";
  }

  /* =========================================================
     UPDATE SIMULATION
     ========================================================= */

  function performUpdate() {
    const values =
      getFormValues();

    const error =
      validateStudent(values);

    if (error) {
      setStatus(
        error,
        "error"
      );

      showMessage(
        error,
        "warning",
        "Validation"
      );

      return;
    }

    const index =
      demoState.findIndex(
        (student) =>
          student.student_id ===
          values.student_id
      );

    if (index === -1) {
      setStatus(
        "No matching record was updated.",
        "error"
      );

      showMessage(
        "No matching record was updated.",
        "warning",
        "Update Result"
      );

      return;
    }

    demoState[index] = values;

    refreshTable(
      values.student_id
    );

    setStatus(
      "1 row updated. JTable refreshed.",
      "success"
    );

    showMessage(
      "Student record updated successfully.",
      "success",
      "Update Result"
    );
  }

  /* =========================================================
     DELETE SIMULATION
     ========================================================= */

  function showDeleteConfirmation() {
    const values =
      getFormValues();

    if (!values.student_id) {
      setStatus(
        "Select a student record first.",
        "error"
      );

      showMessage(
        "Select a student record first.",
        "warning",
        "Delete Record"
      );

      return;
    }

    const host =
      document.getElementById(
        "demoMessageHost"
      );

    if (!host) {
      return;
    }

    host.innerHTML = `
      <div
        class="swing-message warning demo-confirm-panel"
      >

        <div class="swing-message-title">
          Confirm Record Deletion
        </div>

        <div class="swing-message-body">

          <span
            class="swing-message-icon"
            aria-hidden="true"
          >
            !
          </span>

          <p>
            Permanently delete student ID
            ${values.student_id}?
          </p>

        </div>

        <div class="swing-message-actions">

          <button
            class="swing-button danger"
            type="button"
            id="demoConfirmDelete"
          >
            Yes
          </button>

          <button
            class="swing-button"
            type="button"
            id="demoCancelDelete"
          >
            No
          </button>

        </div>

      </div>
    `;

    document
      .getElementById(
        "demoConfirmDelete"
      )
      ?.addEventListener(
        "click",
        () => {
          demoState =
            demoState.filter(
              (student) =>
                student.student_id !==
                values.student_id
            );

          clearForm();

          refreshTable(null);

          setStatus(
            "1 row deleted. JTable refreshed.",
            "success"
          );

          showMessage(
            "Student record deleted successfully.",
            "success",
            "Delete Result"
          );
        }
      );

    document
      .getElementById(
        "demoCancelDelete"
      )
      ?.addEventListener(
        "click",
        () => {
          host.innerHTML = "";

          setStatus(
            "Delete operation cancelled.",
            "info"
          );
        }
      );
  }

  /* =========================================================
     BUTTON EVENTS
     ========================================================= */

  function bindManagerEvents() {
    bindTableRows();

    document
      .getElementById(
        "demoUpdateButton"
      )
      ?.addEventListener(
        "click",
        performUpdate
      );

    document
      .getElementById(
        "demoDeleteButton"
      )
      ?.addEventListener(
        "click",
        showDeleteConfirmation
      );

    document
      .getElementById(
        "demoClearButton"
      )
      ?.addEventListener(
        "click",
        clearForm
      );

    document
      .getElementById(
        "demoReloadButton"
      )
      ?.addEventListener(
        "click",
        () => {
          demoState =
            baseStudents();

          const first =
            demoState[0];

          fillForm(first);

          setStatus(
            "Records reloaded from the simulated database.",
            "success"
          );
        }
      );
  }

  /* =========================================================
     DATABASE CONNECTION RESULT
     ========================================================= */

  function renderConnection() {
    modalTitle.textContent =
      "DatabaseConnection.java";

    modalSubtitle.textContent =
      "Expected JDBC connection result";

    modalBody.innerHTML =
      infoStrip(
        "This represents the expected result when DriverManager successfully opens the configured MySQL connection."
      ) +
      windowShell(
        "JdbcUpdateDeleteLesson",
        `
        <div class="swing-app-body">

          <div class="demo-console">

            <div class="demo-console-title">
              Run Output
            </div>

            <pre>Connecting to jdbc:mysql://localhost:3306/school_db ...
<span class="console-success">Connection established successfully.</span>
Driver: MySQL Connector/J
Database: school_db
Status: READY</pre>

          </div>

          ${messageBox(
            "Database connection successful.",
            "success",
            "JDBC Connection"
          )}

        </div>
        `,
        "Connection ready."
      );

    modalBody
      .querySelector(
        "[data-message-ok]"
      )
      ?.addEventListener(
        "click",
        (event) => {
          event.target
            .closest(
              ".swing-message"
            )
            ?.remove();
        }
      );
  }

  /* =========================================================
     FULL / UPDATE / DELETE / LOAD DEMO
     ========================================================= */

  function renderManager(mode) {
    demoState =
      baseStudents();

    let selectedId = 1;

    let suggestedYear = null;

    let title =
      "Student Management Frame";

    let subtitle =
      "Interactive Swing/JDBC result simulation";

    let note =
      "Select a JTable row, edit the form, and use UPDATE, DELETE, CLEAR, or REFRESH.";

    if (mode === "update") {
      suggestedYear = 3;

      title =
        "UPDATE Operation";

      subtitle =
        "PreparedStatement + executeUpdate()";

      note =
        "Ana Reyes is selected. The form proposes year level 3 so you can click UPDATE and see the JTable refresh.";
    } else if (mode === "delete") {
      selectedId = 2;

      title =
        "DELETE Operation";

      subtitle =
        "Primary-key deletion with confirmation";

      note =
        "Marco Santos is selected. Click DELETE to see the confirmation step before the simulated row is removed.";
    } else if (mode === "load") {
      title =
        "JTable Record Loading";

      subtitle =
        "Expected SELECT query output";

      note =
        "The JTable is populated with the two records returned by the simulated SELECT query.";
    }

    modalTitle.textContent =
      title;

    modalSubtitle.textContent =
      subtitle;

    modalBody.innerHTML =
      infoStrip(note) +
      windowShell(
        "Student Management System",
        studentManagerBody(
          selectedId,
          suggestedYear
        ),
        mode === "load"
          ? "2 rows loaded from students."
          : "Ready."
      );

    bindManagerEvents();

    if (mode === "load") {
      setStatus(
        "2 rows loaded from students.",
        "success"
      );
    }
  }

  /* =========================================================
     ACTION LISTENER DEMO
     ========================================================= */

  function renderListeners() {
    modalTitle.textContent =
      "Action Listeners";

    modalSubtitle.textContent =
      "Button and JTable event simulation";

    modalBody.innerHTML =
      infoStrip(
        "Use the buttons below to see how Swing event listeners call application methods."
      ) +
      windowShell(
        "ActionListener Demonstration",
        `
        <div class="swing-app-body">

          <div class="swing-manager-layout">

            <section class="swing-panel">

              <p class="swing-panel-title">
                Swing Controls
              </p>

              <div class="swing-button-row">

                <button
                  class="swing-button primary"
                  type="button"
                  data-event-demo="updateStudent()"
                >
                  UPDATE
                </button>

                <button
                  class="swing-button danger"
                  type="button"
                  data-event-demo="deleteStudent()"
                >
                  DELETE
                </button>

                <button
                  class="swing-button"
                  type="button"
                  data-event-demo="clearForm()"
                >
                  CLEAR
                </button>

              </div>

              <div style="margin-top: 16px;">

                ${tableMarkup(
                  baseStudents(),
                  null
                )}

              </div>

            </section>

            <section class="swing-panel">

              <p class="swing-panel-title">
                Event Log
              </p>

              <div
                class="demo-event-log"
                id="demoEventLog"
              >

                <div class="demo-empty">
                  Interact with a button
                  or JTable row.
                </div>

              </div>

            </section>

          </div>

        </div>
        `,
        "Waiting for a Swing event."
      );

    const log =
      modalBody.querySelector(
        "#demoEventLog"
      );

    function addEvent(message) {
      if (!log) {
        return;
      }

      if (
        log.querySelector(
          ".demo-empty"
        )
      ) {
        log.innerHTML = "";
      }

      const entry =
        document.createElement("p");

      const time =
        new Date().toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }
        );

      entry.innerHTML = `
        <span class="demo-event-time">
          ${escapeHtml(time)}
        </span>
        ${escapeHtml(message)}
      `;

      log.prepend(entry);

      setStatus(
        message,
        "info"
      );
    }

    modalBody
      .querySelectorAll(
        "[data-event-demo]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            addEvent(
              `ActionEvent → ${button.dataset.eventDemo}`
            );
          }
        );
      });

    modalBody
      .querySelectorAll(
        "[data-student-id]"
      )
      .forEach((row) => {
        row.addEventListener(
          "click",
          () => {
            modalBody
              .querySelectorAll(
                "[data-student-id]"
              )
              .forEach(
                (item) =>
                  item.classList.remove(
                    "is-selected"
                  )
              );

            row.classList.add(
              "is-selected"
            );

            addEvent(
              `ListSelectionEvent → populateFormFromSelectedRow() for student ID ${row.dataset.studentId}`
            );
          }
        );
      });
  }

  /* =========================================================
     CHOOSE RUN EXAMPLE
     ========================================================= */

  function renderExample(mode) {
    switch (mode) {
      case "maven":
        renderMaven();
        break;

      case "schema":
        renderSchema();
        break;

      case "connection":
        renderConnection();
        break;

      case "update":
      case "delete":
      case "load":
      case "full":
        renderManager(mode);
        break;

      case "listeners":
        renderListeners();
        break;

      default:
        renderManager("full");
    }
  }

  /* =========================================================
     OPEN DEMO MODAL
     ========================================================= */

  function openDemo(
    mode,
    trigger
  ) {
    if (
      !modal ||
      !modalBody ||
      !modalTitle ||
      !modalSubtitle
    ) {
      return;
    }

    lastFocusedElement =
      trigger ||
      document.activeElement;

    renderExample(mode);

    modal.hidden = false;

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "demo-open"
    );

    window.requestAnimationFrame(
      () => {
        modal
          .querySelector(
            ".java-demo-close"
          )
          ?.focus();
      }
    );
  }

  /* =========================================================
     CLOSE DEMO MODAL
     ========================================================= */

  function closeDemo() {
    if (
      !modal ||
      modal.hidden
    ) {
      return;
    }

    modal.hidden = true;

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "demo-open"
    );

    modalBody.innerHTML = "";

    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus ===
        "function"
    ) {
      lastFocusedElement.focus();
    }
  }

  /* =========================================================
     RUN EXAMPLE BUTTONS
     ========================================================= */

  document
    .querySelectorAll(
      "[data-run-example]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          openDemo(
            button.dataset.runExample,
            button
          );
        }
      );
    });

  /* =========================================================
     MODAL CLOSE BUTTONS
     ========================================================= */

  modal
    ?.querySelectorAll(
      "[data-demo-close]"
    )
    .forEach((control) => {
      control.addEventListener(
        "click",
        closeDemo
      );
    });

  /* =========================================================
     KEYBOARD CONTROL
     ========================================================= */

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        if (
          modal &&
          !modal.hidden
        ) {
          closeDemo();
        } else {
          setMenu(false);
        }
      }

      /*
       * Keep keyboard focus inside the
       * Run Example dialog.
       */
      if (
        event.key === "Tab" &&
        modal &&
        !modal.hidden
      ) {
        const focusable = [
          ...modal.querySelectorAll(
            `
            button:not([disabled]),
            input:not([disabled]),
            [href],
            [tabindex]:not([tabindex="-1"])
            `
          )
        ].filter(
          (element) =>
            element.offsetParent !== null
        );

        if (!focusable.length) {
          return;
        }

        const first =
          focusable[0];

        const last =
          focusable[
            focusable.length - 1
          ];

        if (
          event.shiftKey &&
          document.activeElement ===
            first
        ) {
          event.preventDefault();

          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement ===
            last
        ) {
          event.preventDefault();

          first.focus();
        }
      }
    }
  );

  /* =========================================================
     ACTIVE SIDEBAR LESSON
     ========================================================= */

  const sidebarLinks = [
    ...document.querySelectorAll(
      ".sidebar-card a[href^='#']"
    )
  ];

  const sections =
    sidebarLinks
      .map((link) =>
        document.querySelector(
          link.getAttribute("href")
        )
      )
      .filter(Boolean);

  if (
    "IntersectionObserver" in window &&
    sections.length
  ) {
    const observer =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              )[0];

          if (!visible) {
            return;
          }

          sidebarLinks.forEach(
            (link) => {
              const active =
                link.getAttribute(
                  "href"
                ) ===
                `#${visible.target.id}`;

              link.classList.toggle(
                "is-active",
                active
              );

              if (active) {
                link.setAttribute(
                  "aria-current",
                  "true"
                );
              } else {
                link.removeAttribute(
                  "aria-current"
                );
              }
            }
          );
        },
        {
          rootMargin:
            "-20% 0px -65% 0px",

          threshold: [
            0.05,
            0.2,
            0.5
          ]
        }
      );

    sections.forEach(
      (section) =>
        observer.observe(section)
    );
  }
})();