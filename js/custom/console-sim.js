// Console typing simulation for the interactive slide
(function () {
  function typeTo(element, text, speed, cb) {
    let i = 0;
    function step() {
      if (i <= text.length) {
        element.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else if (cb) {
        cb();
      }
    }
    step();
  }

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
    ].join("\n");
    out.textContent += "\n" + conflict;
  }

  function onSlideChanged(event) {
    const current = event.currentSlide;
    if (current && current.querySelector && current.querySelector("#console")) {
      const inputCaret = document.getElementById("console-caret");
      const out = document.getElementById("console-output");
      out.textContent = "";
      inputCaret.textContent = "";
      // simulate typing
      typeTo(inputCaret, "git merge", 120, function () {
        // after typing, show a little pause then output conflict
        setTimeout(function () {
          showConflict();
        }, 600);
      });
    }
  }

  function onReady(event) {
    const slide = Reveal.getCurrentSlide();
    if (slide && slide.querySelector && slide.querySelector("#console")) {
      const inputCaret = document.getElementById("console-caret");
      inputCaret.textContent = "";
      typeTo(inputCaret, "git merge", 120, function () {
        setTimeout(function () {
          showConflict();
        }, 600);
      });
    }
  }

  if (window.Reveal) {
    Reveal.on("slidechanged", onSlideChanged);
    Reveal.on("ready", onReady);
  } else {
    // If Reveal isn't loaded yet, wait for DOMContentLoaded and then wire events
    document.addEventListener("DOMContentLoaded", function () {
      if (window.Reveal) {
        Reveal.on("slidechanged", onSlideChanged);
        Reveal.on("ready", onReady);
      }
    });
  }
})();
