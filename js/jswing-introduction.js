(() => {
  'use strict';

  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  const menuButton = document.querySelector('.menu-button');
  const topnav = document.querySelector('.topnav');

  if (menuButton && topnav) {
    const closeMenu = () => {
      topnav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    };

    menuButton.addEventListener('click', () => {
      const isOpen = topnav.classList.toggle('open');

      menuButton.setAttribute(
        'aria-expanded',
        String(isOpen)
      );
    });

    /* Close menu after clicking a navigation link */
    topnav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    /* Close menu when Escape is pressed */
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    /* Reset mobile menu on desktop */
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) {
        closeMenu();
      }
    });
  }


  /* =========================================================
     COPY JAVA CODE BUTTON
     ========================================================= */

  document.querySelectorAll('.copy-code').forEach((button) => {

    button.addEventListener('click', async () => {

      const code =
        button
          .closest('.code-block')
          ?.querySelector('pre code')
          ?.innerText ?? '';

      const originalText = button.textContent;

      try {
        await navigator.clipboard.writeText(code);
      } catch (error) {

        /* Fallback for browsers that do not allow Clipboard API */
        const textarea = document.createElement('textarea');

        textarea.value = code;
        textarea.setAttribute('readonly', '');

        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand('copy');

        textarea.remove();
      }

      button.textContent = 'Copied ✓';

      setTimeout(() => {
        button.textContent = originalText;
      }, 1600);

    });

  });


  /* =========================================================
     RUN JAVA EXAMPLE BUTTONS

     IMPORTANT:
     A normal web browser cannot directly compile Java Swing.

     Therefore, these buttons display a browser-based preview
     of the expected Java program output.
     ========================================================= */

  document.querySelectorAll('.run-code').forEach((button) => {

    button.addEventListener('click', () => {

      const targetID = button.dataset.runTarget;

      const panel = document.getElementById(targetID);

      if (!panel) {
        return;
      }

      const opening = panel.hidden;

      panel.hidden = !opening;

      button.setAttribute(
        'aria-expanded',
        String(opening)
      );

      if (opening) {

        button.textContent = '■ Hide Result';

        /*
         Add small animation every time
         the example runs.
        */

        panel.classList.remove('run-flash');

        void panel.offsetWidth;

        panel.classList.add('run-flash');


        /*
         Automatically focus the demo
         text field when available.
        */

        const input =
          panel.querySelector('.demo-name-input');

        if (input) {
          setTimeout(() => {
            input.focus();
          }, 120);
        }

      } else {

        button.textContent = '▶ Run Example';

      }

    });

  });


  /* =========================================================
     INTERACTIVE STUDENT GREETER / SWING SIMULATION
     ========================================================= */

  document.querySelectorAll('.run-example').forEach((panel) => {

    const input =
      panel.querySelector('.demo-name-input');

    const greetButton =
      panel.querySelector('.demo-greet-button');

    const result =
      panel.querySelector('.demo-result');


    /*
     Some example panels do not contain
     interactive fields. Ignore those panels.
    */

    if (!input || !greetButton || !result) {
      return;
    }


    const showGreeting = () => {

      const name = input.value.trim();

      if (name) {

        result.textContent =
          `Welcome, ${name}!`;

        result.classList.add('is-success');

        result.classList.remove('is-warning');

      } else {

        result.textContent =
          'Please enter a name.';

        result.classList.add('is-warning');

        result.classList.remove('is-success');

      }

    };


    /*
     Run when the Greet Student
     button is clicked.
    */

    greetButton.addEventListener(
      'click',
      showGreeting
    );


    /*
     Also allow Enter key.
    */

    input.addEventListener('keydown', (event) => {

      if (event.key === 'Enter') {

        event.preventDefault();

        showGreeting();

      }

    });

  });


  /* =========================================================
     KNOWLEDGE CHECK / QUIZ
     ========================================================= */

  const quizButton =
    document.querySelector('.quiz-button');

  const quizCards =
    [...document.querySelectorAll('.quiz-card')];


  /*
   Correct answers
  */

  const correctAnswers = {

    q1: 'JFrame',

    q2: 'setVisible(true)',

    q3: 'ActionListener'

  };


  /*
   Enable Check Answers button only
   when all questions are answered.
  */

  const updateQuizButton = () => {

    if (!quizButton) {
      return;
    }

    const allAnswered =
      quizCards.every((card) => {

        return card.querySelector(
          'input:checked'
        );

      });

    quizButton.disabled = !allAnswered;

  };


  quizCards.forEach((card) => {

    card
      .querySelectorAll(
        'input[type="radio"]'
      )
      .forEach((radio) => {

        radio.addEventListener(
          'change',
          updateQuizButton
        );

      });

  });


  /* =========================================================
     CHECK QUIZ ANSWERS
     ========================================================= */

  if (quizButton) {

    quizButton.addEventListener('click', () => {

      let score = 0;


      quizCards.forEach((card) => {

        const selected =
          card.querySelector(
            'input:checked'
          );

        const labels =
          card.querySelectorAll('label');


        /*
         Remove previous answer colors.
        */

        labels.forEach((label) => {

          label.classList.remove(
            'correct',
            'wrong'
          );

        });


        if (!selected) {
          return;
        }


        const correctValue =
          correctAnswers[selected.name];

        const selectedLabel =
          selected.closest('label');


        /*
         Correct answer
        */

        if (selected.value === correctValue) {

          score++;

          if (selectedLabel) {
            selectedLabel.classList.add(
              'correct'
            );
          }

        }

        /*
         Wrong answer
        */

        else {

          if (selectedLabel) {

            selectedLabel.classList.add(
              'wrong'
            );

          }


          /*
           Highlight the correct answer.
          */

          const correctInput =
            card.querySelector(
              `input[value="${CSS.escape(correctValue)}"]`
            );


          if (correctInput) {

            const correctLabel =
              correctInput.closest('label');

            if (correctLabel) {

              correctLabel.classList.add(
                'correct'
              );

            }

          }

        }

      });


      /* =====================================================
         QUIZ RESULT
         ===================================================== */

      let scoreCard =
        document.querySelector('.score-card');


      if (!scoreCard) {

        scoreCard =
          document.createElement('div');

        scoreCard.className =
          'score-card';

        quizButton.insertAdjacentElement(
          'afterend',
          scoreCard
        );

      }


      let message = '';


      if (score === 3) {

        message =
          'Excellent. You identified all three Swing fundamentals.';

      }

      else if (score === 2) {

        message =
          'Good work. Review the highlighted answer for the remaining item.';

      }

      else {

        message =
          'Review the highlighted correct answers, then try the lesson again.';

      }


      scoreCard.innerHTML = `
        <b>${score}/3</b>

        <div>

          <strong>
            Knowledge-check result
          </strong>

          <p>
            ${message}
          </p>

        </div>
      `;

    });

  }

})();