// Console typing simulation for the interactive slide
(function () {
  // Simple typing helper that returns a cancel function so we can stop it
  function typeTo(element, text, speed, cb) {
    let i = 0;
    let cancelled = false;
    let lastTimer = null;

    function step() {
      if (cancelled) return;
      if (i <= text.length) {
        element.textContent = text.slice(0, i);
        i++;
        lastTimer = setTimeout(step, speed);
        controller.timeouts.push(lastTimer);
      } else if (cb && !cancelled) {
        cb();
      }
    }

    step();

    return function cancel() {
      cancelled = true;
      if (lastTimer) {
        clearTimeout(lastTimer);
      }
    };
  }

  // Controller to keep track of timers and typing cancel function
  const controller = {
    timeouts: [],
    typingCancel: null,
  };

  function clearControllerTimers() {
    // clear any scheduled timeouts
    controller.timeouts.forEach(function (id) {
      clearTimeout(id);
    });
    controller.timeouts.length = 0;
    // cancel typing if in progress
    if (typeof controller.typingCancel === "function") {
      try {
        controller.typingCancel();
      } catch (e) {
        /* ignore */
      }
      controller.typingCancel = null;
    }
  }

  // Reveal the conflict output line-by-line
  function showConflict() {
    const out = document.getElementById("console-output");
    const conflict = [
      "Auto-merging src/lib.rs",
      "CONFLICT (content): Merge conflict in src/lib.rs",
      "Automatic merge failed; fix conflicts and then commit the result.",
      "",
      "<<<<<<< HEAD",
      "pub trait Storage { fn get(&self, k: &str) -> BoxFuture<'_, Result<Option<Vec<u8>>, Error>>; }",
      "=======",
      "pub struct InMemoryStorage { /* uses tokio::RwLock<HashMap<String, Vec<u8>>> */ }",
      ">>>>>>> feature/blob-store",
      "",
      "(resolve conflicts and then run: git add src/lib.rs)",
    ];

    // append lines one at a time so it looks like output being printed
    let baseDelay = 0;
    var perLineDelay = 80;
    conflict.forEach(function (line, idx) {
      var id = setTimeout(function () {
        // preserve an initial leading newline if output isn't empty
        if (out.textContent.length === 0 && idx === 0) {
          out.textContent = line;
        } else {
          out.textContent += "\n" + line;
        }
      }, baseDelay + idx * perLineDelay);
      controller.timeouts.push(id);
    });
  }

  function onSlideChanged(event) {
    const current = event.currentSlide;
    if (current && current.querySelector && current.querySelector("#console")) {
      const inputCaret = document.getElementById("console-caret");
      const out = document.getElementById("console-output");
      // clear any prior timers/cancel typing in case user navigated quickly
      clearControllerTimers();

      out.textContent = "";
      inputCaret.textContent = "";
      // simulate typing and save cancel function so we can stop if needed
      controller.typingCancel = typeTo(
        inputCaret,
        "git merge",
        120,
        function () {
          // after typing, show a little pause then output conflict
          var id = setTimeout(function () {
            showConflict();
          }, 600);
          controller.timeouts.push(id);
          // typing is done
          controller.typingCancel = null;
        }
      );
    }
  }

  function onReady(event) {
    const slide = Reveal.getCurrentSlide();
    if (slide && slide.querySelector && slide.querySelector("#console")) {
      // make sure any previous timers are cleared
      clearControllerTimers();

      const inputCaret = document.getElementById("console-caret");
      inputCaret.textContent = "";
      controller.typingCancel = typeTo(
        inputCaret,
        "git merge",
        120,
        function () {
          var id = setTimeout(function () {
            showConflict();
          }, 600);
          controller.timeouts.push(id);
          controller.typingCancel = null;
        }
      );
    }
  }

  // Avoid adding duplicate listeners: attach once when Reveal exists or when ready
  function wireRevealHandlers() {
    // remove existing listeners if Reveal provides an 'off' method
    if (window.Reveal && typeof Reveal.off === "function") {
      try {
        Reveal.off("slidechanged", onSlideChanged);
      } catch (e) {}
      try {
        Reveal.off("ready", onReady);
      } catch (e) {}
    }
    if (window.Reveal) {
      Reveal.on("slidechanged", onSlideChanged);
      Reveal.on("ready", onReady);
    }
  }

  if (window.Reveal) {
    wireRevealHandlers();
  } else {
    // If Reveal isn't loaded yet, wait for DOMContentLoaded and then wire events
    document.addEventListener("DOMContentLoaded", function () {
      if (window.Reveal) wireRevealHandlers();
    });
  }
})();
