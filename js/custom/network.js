// Interactive behavior: toggle client offline/online
(function () {
  function init() {
    const clients = document.querySelectorAll(".center-graphic .client");
    const links = document.querySelectorAll(".center-graphic .link");
    clients.forEach((c) => {
      c.addEventListener("click", function () {
        const id = c.getAttribute("data-id");
        const isOffline = c.classList.toggle("offline");
        // find corresponding link(s)
        links.forEach((l) => {
          if (l.getAttribute("data-from") === id) {
            if (isOffline) {
              l.classList.add("offline");
            } else {
              l.classList.remove("offline");
            }
          }
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
