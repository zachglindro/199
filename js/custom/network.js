// Interactive behavior: toggle client offline/online
(function () {
  function init() {
    const clients = document.querySelectorAll(".center-graphic .client");
    const links = document.querySelectorAll(".center-graphic .link");
    const server = document.querySelector(".center-graphic #server");
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

    // Make the server clickable too: toggles its offline state and toggles all links
    if (server) {
      server.style.cursor = "pointer";
      server.addEventListener("click", function () {
        const isOffline = server.classList.toggle("offline");
        // toggle offline on all links
        links.forEach((l) => {
          if (isOffline) {
            l.classList.add("offline");
          } else {
            l.classList.remove("offline");
          }
        });
        // also toggle offline state on each client so they visibly turn off/on
        clients.forEach((c) => {
          if (isOffline) {
            c.classList.add("offline");
          } else {
            c.classList.remove("offline");
          }
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
