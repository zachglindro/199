// Reveal initialization and CRDT delayed-reveal behavior
// Extracted from inline script in index.html
(function () {
  // More info about initialization & config:
  // - https://revealjs.com/initialization/
  // - https://revealjs.com/config/
  if (typeof Reveal !== "undefined") {
    Reveal.initialize({
      hash: true,
      // Learn about plugins: https://revealjs.com/plugins/
      plugins: [RevealMarkdown, RevealHighlight, RevealNotes],
    });
  }

  // Delayed reveal for CRDT word fragments on the CRDT slide step
  var crdtTimeout = null;
  var autoAdvanceTimer = null; // timer for advancing from step 1 -> step 2

  function hideTails() {
    var tails = document.querySelectorAll(".crdts-tail");
    tails.forEach(function (el) {
      el.classList.remove("visible");
    });
  }

  function revealTailsDelayed() {
    // Clear any existing timer
    if (crdtTimeout) {
      clearTimeout(crdtTimeout);
      crdtTimeout = null;
    }
    crdtTimeout = setTimeout(function () {
      var tails = document.querySelectorAll(".crdts-tail");
      tails.forEach(function (el) {
        el.classList.add("visible");
      });
      crdtTimeout = null;
    }, 1000);
  }

  function scheduleAutoAdvance() {
    // Advance from the letters-only step to the words step after 1s
    if (autoAdvanceTimer) return; // already scheduled
    autoAdvanceTimer = setTimeout(function () {
      autoAdvanceTimer = null;
      // Move to next vertical step (the words layout)
      if (typeof Reveal !== "undefined") Reveal.next();
    }, 1000);
  }

  function cancelAutoAdvance() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
  }

  // On initial ready and when the slide changes, check if we're on the CRDT step
  function onRevealEvent(e) {
    // The step containing .crdts-words will be in the DOM as the current slide
    var current =
      e && e.currentSlide
        ? e.currentSlide
        : document.querySelector(".slides section.present");
    if (!current) return;

    // If we're on the letters-only first step: it has .crdts-row but not .crdts-words
    var isLettersOnly =
      current.querySelector &&
      current.querySelector(".crdts-row") &&
      !current.querySelector(".crdts-words");

    if (current.querySelector && current.querySelector(".crdts-words")) {
      // reveal tails after delay
      revealTailsDelayed();
      // ensure we don't auto-advance when already on the words step
      cancelAutoAdvance();
    } else {
      // hide immediately when leaving words step
      if (crdtTimeout) {
        clearTimeout(crdtTimeout);
        crdtTimeout = null;
      }
      hideTails();
      // If we landed on the letters-only step, schedule auto-advance to next step
      if (isLettersOnly) {
        scheduleAutoAdvance();
      } else {
        cancelAutoAdvance();
      }
    }
  }

  if (typeof Reveal !== "undefined") {
    Reveal.on("ready", onRevealEvent);
    Reveal.on("slidechanged", onRevealEvent);
    // In case fragments/auto-animate steps are used inside the slide, also listen for 'fragmentshown' and 'fragmenthidden'
    Reveal.on("fragmentshown", function (e) {
      var slide =
        e.fragment && e.fragment.closest
          ? e.fragment.closest("section.present")
          : null;
      if (slide && slide.querySelector(".crdts-words")) {
        revealTailsDelayed();
      }
    });
    Reveal.on("fragmenthidden", function (e) {
      var slide =
        e.fragment && e.fragment.closest
          ? e.fragment.closest("section.present")
          : null;
      if (slide && slide.querySelector(".crdts-words")) {
        if (crdtTimeout) {
          clearTimeout(crdtTimeout);
          crdtTimeout = null;
        }
        hideTails();
      }
    });
  } else {
    // If Reveal isn't available yet, attach handlers when DOM is ready
    document.addEventListener("DOMContentLoaded", function () {
      if (typeof Reveal !== "undefined") {
        Reveal.on("ready", onRevealEvent);
        Reveal.on("slidechanged", onRevealEvent);
      }
    });
  }
})();
