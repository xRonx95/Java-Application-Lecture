(() => {
  "use strict";

  /* =========================================================
     MOBILE NAVIGATION
  ========================================================= */
  const menuButton = document.querySelector(".menu-button");
  const navigation = document.getElementById("primary-navigation");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuButton.classList.toggle("open", isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.classList.remove("open");
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.classList.remove("open");
      }
    });
  }


  /* =========================================================
     COPY CODE BUTTON
  ========================================================= */
  document.querySelectorAll(".copy-button").forEach((button) => {

    button.addEventListener("click", async () => {

      const targetId = button.dataset.copyTarget;

      const target = targetId
        ? document.getElementById(targetId)
        : null;

      if (!target) return;

      const text = target.textContent || "";

      try {

        await navigator.clipboard.writeText(text);

      } catch (error) {

        /*
          Fallback for browsers where
          navigator.clipboard is unavailable.
        */

        const textarea = document.createElement("textarea");

        textarea.value = text;

        textarea.setAttribute("readonly", "");

        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();
      }


      /* Change button appearance temporarily */

      const originalText = button.textContent;

      button.textContent = "Copied ✓";

      button.classList.add("copied");

      setTimeout(() => {

        button.textContent = originalText;

        button.classList.remove("copied");

      }, 1400);

    });

  });


  /* =========================================================
     GUI EXAMPLE MODAL
  ========================================================= */

  const modal = document.getElementById("example-modal");

  const dialog = modal
    ? modal.querySelector(".example-dialog")
    : null;

  const dialogTitle =
    document.getElementById("example-dialog-title");

  const dialogBody =
    document.getElementById("example-dialog-body");

  let lastTrigger = null;
  let demoTimers = [];


  function clearDemoTimers() {
    demoTimers.forEach((timerId) => clearTimeout(timerId));
    demoTimers = [];
  }


  function setRunButtonState(button, expanded) {

    if (!button) return;

    button.setAttribute(
      "aria-expanded",
      String(expanded)
    );

  }


  /* =========================================================
     JAVA EXAMPLE RESULTS
  ========================================================= */

  const examples = {

    /* -------------------------------------------------------
       DATABASE CONNECTION CLASS
    ------------------------------------------------------- */

    "connection-config": {

      title:
        "DatabaseConnection.java — Configuration Preview",

      html: `

        <div class="gui-window">

          <div class="gui-window-header">

            <span>
              Database Connection Configuration
            </span>

            <span
              class="gui-window-controls"
              aria-hidden="true"
            >
              <i></i>
              <i></i>
              <i></i>
            </span>

          </div>


          <div class="gui-content">

            <h3 class="gui-title">
              MySQL Connection Settings
            </h3>

            <p class="gui-subtitle">
              This GUI represents the database configuration
              defined inside
              <code>DatabaseConnection.java</code>.
            </p>


            <div class="status-card">

              <span class="status-icon">
                ✓
              </span>

              <div>

                <strong>
                  Configuration Ready
                </strong>

                <span>
                  The Java class is prepared to request
                  a JDBC database connection.
                </span>

              </div>

            </div>


            <div class="gui-grid">

              <div class="gui-field">

                <span>
                  Host
                </span>

                <strong>
                  localhost
                </strong>

              </div>


              <div class="gui-field">

                <span>
                  Port
                </span>

                <strong>
                  3306
                </strong>

              </div>


              <div class="gui-field">

                <span>
                  Database
                </span>

                <strong>
                  school_db
                </strong>

              </div>


              <div class="gui-field">

                <span>
                  Username
                </span>

                <strong>
                  root
                </strong>

              </div>


              <div class="gui-field">

                <span>
                  SSL
                </span>

                <strong>
                  false
                </strong>

              </div>


              <div class="gui-field">

                <span>
                  Time Zone
                </span>

                <strong>
                  UTC
                </strong>

              </div>

            </div>


            <div class="console-panel">JDBC URL:
jdbc:mysql://localhost:3306/school_db?useSSL=false&amp;serverTimezone=UTC

DatabaseConnection class loaded.

Ready to call:
DatabaseConnection.open()</div>

          </div>

        </div>

      `
    },


    /* -------------------------------------------------------
       CONNECTION TEST
    ------------------------------------------------------- */

    "connection-test": {

      title:
        "ConnectionTest.java — Program Output",

      html: `

        <div class="gui-window">

          <div class="gui-window-header">

            <span>
              MySQL Connection Test
            </span>

            <span
              class="gui-window-controls"
              aria-hidden="true"
            >

              <i></i>
              <i></i>
              <i></i>

            </span>

          </div>


          <div class="gui-content">

            <h3 class="gui-title">
              Database Connection Result
            </h3>

            <p class="gui-subtitle">
              This is the expected result when MySQL,
              Connector/J, and the JDBC configuration
              are working correctly.
            </p>


            <div class="status-card">

              <span class="status-icon">
                ✓
              </span>

              <div>

                <strong>
                  Connection Successful
                </strong>

                <span>
                  Java successfully communicated with
                  the MySQL database server.
                </span>

              </div>

            </div>


            <div class="gui-grid">

              <div class="gui-field">

                <span>
                  Connection Status
                </span>

                <strong>
                  Connected
                </strong>

              </div>


              <div class="gui-field">

                <span>
                  Database
                </span>

                <strong>
                  school_db
                </strong>

              </div>


              <div class="gui-field">

                <span>
                  Server
                </span>

                <strong>
                  localhost
                </strong>

              </div>


              <div class="gui-field">

                <span>
                  Port
                </span>

                <strong>
                  3306
                </strong>

              </div>


              <div class="gui-field">

                <span>
                  Driver
                </span>

                <strong>
                  MySQL Connector/J
                </strong>

              </div>


              <div class="gui-field">

                <span>
                  JDBC
                </span>

                <strong>
                  Active
                </strong>

              </div>

            </div>


            <h4>
              NetBeans Output
            </h4>


            <div class="console-panel">run:
Connection successful.
Database: school_db

BUILD SUCCESSFUL</div>

          </div>

        </div>

      `
    },


    /* -------------------------------------------------------
       PREPARED STATEMENT / INSERT DATA
    ------------------------------------------------------- */

    "prepared-insert": {

      title:
        "PreparedStatement — Insert Student Record",

      html: `

        <div class="gui-window">

          <div class="gui-window-header">

            <span>
              Student Database Application
            </span>

            <span
              class="gui-window-controls"
              aria-hidden="true"
            >

              <i></i>
              <i></i>
              <i></i>

            </span>

          </div>


          <div class="gui-content">

            <h3 class="gui-title">
              Add Student Record
            </h3>

            <p class="gui-subtitle">
              These values represent the three
              <code>?</code> placeholders passed
              to the Java
              <code>PreparedStatement</code>.
            </p>


            <div class="gui-form">


              <div class="gui-form-row">

                <label>
                  Student Number
                </label>

                <input
                  class="gui-input"
                  type="text"
                  value="2026-001"
                  readonly
                >

              </div>


              <div class="gui-form-row">

                <label>
                  Full Name
                </label>

                <input
                  class="gui-input"
                  type="text"
                  value="Sample Student"
                  readonly
                >

              </div>


              <div class="gui-form-row">

                <label>
                  Program
                </label>

                <input
                  class="gui-input"
                  type="text"
                  value="BS Information Technology"
                  readonly
                >

              </div>


            </div>


            <div class="gui-action-row">

              <button
                type="button"
                class="gui-primary-button demo-save-button"
              >
                Save Student
              </button>

            </div>


            <div
              class="gui-result"
              id="insert-demo-result"
            >

              Ready to insert the student record.

            </div>


            <h4>
              NetBeans Output
            </h4>


            <div
              class="console-panel"
              id="insert-demo-console"
            >Waiting for Save Student...</div>


          </div>

        </div>

      `
    }

  };


  /* =========================================================
     OPEN EXAMPLE
  ========================================================= */

  function openExample(type, trigger) {

    const example = examples[type];

    if (
      !modal ||
      !dialog ||
      !dialogTitle ||
      !dialogBody ||
      !example
    ) {
      return;
    }


    clearDemoTimers();


    if (lastTrigger && lastTrigger !== trigger) {

      setRunButtonState(
        lastTrigger,
        false
      );

    }


    lastTrigger = trigger;

    setRunButtonState(
      lastTrigger,
      true
    );


    dialogTitle.textContent =
      example.title;


    dialogBody.innerHTML =
      example.html;


    modal.hidden = false;


    document.body.classList.add(
      "example-modal-open"
    );


    /*
      Focus modal for keyboard accessibility.
    */

    requestAnimationFrame(() => {

      dialog.focus();

    });


    /*
      Special behavior for PreparedStatement
      student insert example.
    */

    const saveButton =
      dialogBody.querySelector(
        ".demo-save-button"
      );


    if (saveButton) {

      saveButton.addEventListener(
        "click",
        runInsertExample
      );

    }

  }


  /* =========================================================
     PREPARED STATEMENT SIMULATION
  ========================================================= */

  function runInsertExample(event) {

    const activeButton =
      event?.currentTarget || null;


    if (activeButton) {

      activeButton.disabled = true;

      activeButton.textContent =
        "Running...";

    }


    clearDemoTimers();


    const result =
      document.getElementById(
        "insert-demo-result"
      );


    const consoleOutput =
      document.getElementById(
        "insert-demo-console"
      );


    if (!result || !consoleOutput) {

      if (activeButton) {

        activeButton.disabled = false;

        activeButton.textContent =
          "Save Student";

      }

      return;
    }


    result.classList.remove("success");

    result.classList.add("running");


    result.innerHTML =
      "Connecting to MySQL database...";


    consoleOutput.textContent =
`Connecting to database...
Database: school_db
Preparing SQL statement...`;


    /*
      First simulated step
    */

    demoTimers.push(

      setTimeout(() => {

        result.innerHTML =
          "Preparing student information...";


        consoleOutput.textContent =
`Connecting to database...
Connection successful.

Preparing statement:
INSERT INTO students
(student_number, full_name, program)
VALUES (?, ?, ?)

Binding parameters...`;

      }, 500)

    );


    /*
      Final simulated result
    */

    demoTimers.push(

      setTimeout(() => {

        result.classList.remove("running");

        result.classList.add("success");


        result.innerHTML =
          `
          <strong>
            ✓ Student record inserted successfully.
          </strong>

          <span>
            Rows added: 1
          </span>
          `;


        consoleOutput.textContent =
`Connection successful.

Student Number:
2026-001

Full Name:
Sample Student

Program:
BS Information Technology

Executing PreparedStatement...

Rows added: 1

BUILD SUCCESSFUL`;


        if (activeButton) {

          activeButton.disabled = false;

          activeButton.textContent =
            "Save Student";

        }

      }, 1100)

    );

  }


  /* =========================================================
     CLOSE EXAMPLE
  ========================================================= */

  function closeExample() {

    clearDemoTimers();


    if (!modal) {
      return;
    }


    modal.hidden = true;


    document.body.classList.remove(
      "example-modal-open"
    );


    /*
      Return keyboard focus to
      Run Example button.
    */

    if (lastTrigger) {

      setRunButtonState(
        lastTrigger,
        false
      );


      lastTrigger.focus();

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

      /*
        aria-haspopup already exists in HTML.
        aria-expanded tracks modal state.
      */

      button.setAttribute(
        "aria-expanded",
        "false"
      );


      button.addEventListener(
        "click",
        () => {

          const exampleType =
            button.dataset.runExample;


          openExample(
            exampleType,
            button
          );

        }
      );

    });


  /* =========================================================
     CLOSE BUTTON / BACKDROP
  ========================================================= */

  document
    .querySelectorAll(
      "[data-close-example]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        closeExample
      );

    });


  /* =========================================================
     ESCAPE KEY + KEYBOARD FOCUS
  ========================================================= */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        !modal ||
        modal.hidden ||
        !dialog
      ) {
        return;
      }


      /* Close modal with Escape */

      if (event.key === "Escape") {

        closeExample();

        return;
      }


      /*
        Keep keyboard focus inside
        the open dialog.
      */

      if (event.key === "Tab") {

        const focusable = [

          ...dialog.querySelectorAll(

            'button:not([disabled]), ' +
            'a[href], ' +
            'input:not([disabled]), ' +
            'select:not([disabled]), ' +
            'textarea:not([disabled]), ' +
            '[tabindex]:not([tabindex="-1"])'

          )

        ];


        if (!focusable.length) {

          event.preventDefault();

          dialog.focus();

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
          document.activeElement === first
        ) {

          event.preventDefault();

          last.focus();

        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {

          event.preventDefault();

          first.focus();

        }

      }

    }
  );


  /* =========================================================
     ACTIVE SIDEBAR LESSON SECTION
  ========================================================= */

  const sections = [

    ...document.querySelectorAll(
      "main section[id]"
    )

  ];


  const tocLinks = [

    ...document.querySelectorAll(
      ".contents-list a[href^='#']"
    )

  ];


  if (
    "IntersectionObserver" in window &&
    sections.length &&
    tocLinks.length
  ) {

    const linkById =
      new Map(

        tocLinks.map((link) => [

          link
            .getAttribute("href")
            .slice(1),

          link

        ])

      );


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


          tocLinks.forEach(
            (link) => {

              link.classList.remove(
                "active"
              );

            }
          );


          const activeLink =
            linkById.get(
              visible.target.id
            );


          if (activeLink) {

            activeLink.classList.add(
              "active"
            );

          }

        },

        {

          rootMargin:
            "-18% 0px -68%",

          threshold: [
            0.05,
            0.2,
            0.5
          ]

        }

      );


    sections.forEach(
      (section) => {

        observer.observe(section);

      }
    );

  }

})();