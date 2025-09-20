// Simple interaction controller for the Three Replicas figure
(function () {
  const btn = document.getElementById("replica-btn");
  if (!btn) return;

  const replicas = Array.from(document.querySelectorAll(".replica"));
  const lineAB = document.getElementById("line-ab");
  const lineBC = document.getElementById("line-bc");

  let state = 0; // 0 = start/initial, 1 = offline edits, 2 = synced

  function setInitial() {
    state = 0;
    btn.textContent = "→";
    replicas.forEach((r) => {
      r.querySelector(".status-badge").classList.remove("offline");
      r.querySelector(".status-badge").classList.add("online");
      r.querySelector(".status-badge").textContent = "Online";
      // reset lists
      const ul = r.querySelector(".replica-list");
      ul.innerHTML = "<li>Milk</li>";
    });
    [lineAB, lineBC].forEach((l) => {
      l.classList.remove("offline");
      l.classList.remove("glow");
    });
  }

  function goOfflineAndEdit() {
    state = 1;
    btn.textContent = "→";

    // Mark B and C offline and change lines
    replicas.forEach((r) => {
      const id = r.getAttribute("data-id");
      const badge = r.querySelector(".status-badge");
      if (id === "B" || id === "C") {
        badge.classList.remove("online");
        badge.classList.add("offline");
        badge.textContent = "Offline";
      } else {
        badge.classList.remove("offline");
        badge.classList.add("online");
        badge.textContent = "Online";
      }
    });

    lineAB.classList.add("offline");
    lineBC.classList.add("offline");

    // Make concurrent edits: A adds Eggs, B adds Bread
    const replicaA = document.querySelector(
      '.replica[data-id="A"] .replica-list'
    );
    const replicaB = document.querySelector(
      '.replica[data-id="B"] .replica-list'
    );

    // animate addition with staggered timing
    addListItem(replicaA, "Eggs", 0);
    addListItem(replicaB, "Bread", 200);
  }

  function goOnlineAndSync() {
    state = 2;
    btn.textContent = "↻";

    // Bring everyone online and animate lines glow
    replicas.forEach((r) => {
      const badge = r.querySelector(".status-badge");
      badge.classList.remove("offline");
      badge.classList.add("online");
      badge.textContent = "Online";
    });

    [lineAB, lineBC].forEach((l) => {
      l.classList.remove("offline");
      l.classList.add("glow");
    });

    // Simulate transfer arrows briefly then merge
    animateSync().then(() => {
      // Animate merged list appearance
      replicas.forEach((r, index) => {
        const ul = r.querySelector(".replica-list");
        // Clear existing items
        ul.innerHTML = "";
        // Add items with staggered animation
        setTimeout(() => addListItem(ul, "Milk", 0), index * 100);
        setTimeout(
          () => addListItem(ul, "Eggs", 150 + index * 100),
          index * 100
        );
        setTimeout(
          () => addListItem(ul, "Bread", 300 + index * 100),
          index * 100
        );
      });
      // remove glow after short delay
      setTimeout(() => {
        [lineAB, lineBC].forEach((l) => l.classList.remove("glow"));
      }, 1200);
    });
  }

  function addListItem(ul, text, delay = 0) {
    const li = document.createElement("li");
    li.textContent = text;
    li.style.opacity = "0";
    li.style.transform = "translateY(-10px) scale(0.95)";
    ul.appendChild(li);
    // animate in with delay
    setTimeout(() => {
      requestAnimationFrame(() => {
        li.style.transition =
          "opacity 400ms ease-out, transform 400ms ease-out";
        li.style.opacity = "1";
        li.style.transform = "translateY(0) scale(1)";
      });
    }, delay);
  }

  function animateSync() {
    return new Promise((resolve) => {
      // create temporary arrows along the lines
      const svg = document.querySelector(".replica-lines");
      if (!svg) {
        resolve();
        return;
      }

      const ns = "http://www.w3.org/2000/svg";
      const arrow1 = document.createElementNS(ns, "path");
      const arrow2 = document.createElementNS(ns, "path");

      arrow1.setAttribute("d", "M120 60 L240 60");
      arrow2.setAttribute("d", "M480 60 L360 60");
      arrow1.setAttribute("class", "replica-anim-arrow");
      arrow2.setAttribute("class", "replica-anim-arrow");
      svg.appendChild(arrow1);
      svg.appendChild(arrow2);

      // Add arrowheads
      const arrowhead1 = document.createElementNS(ns, "polygon");
      const arrowhead2 = document.createElementNS(ns, "polygon");
      arrowhead1.setAttribute("points", "240,55 250,60 240,65");
      arrowhead2.setAttribute("points", "360,55 350,60 360,65");
      arrowhead1.setAttribute("class", "replica-anim-arrowhead");
      arrowhead2.setAttribute("class", "replica-anim-arrowhead");
      svg.appendChild(arrowhead1);
      svg.appendChild(arrowhead2);

      // show arrows with animation
      requestAnimationFrame(() => {
        arrow1.classList.add("show");
        arrow2.classList.add("show");
        arrowhead1.classList.add("show");
        arrowhead2.classList.add("show");
      });

      setTimeout(() => {
        // fade arrows
        arrow1.classList.remove("show");
        arrow2.classList.remove("show");
        arrowhead1.classList.remove("show");
        arrowhead2.classList.remove("show");
        setTimeout(() => {
          svg.removeChild(arrow1);
          svg.removeChild(arrow2);
          svg.removeChild(arrowhead1);
          svg.removeChild(arrowhead2);
          resolve();
        }, 300);
      }, 1000);
    });
  }

  btn.addEventListener("click", () => {
    if (state === 0) goOfflineAndEdit();
    else if (state === 1) goOnlineAndSync();
    else setInitial();
  });

  // initialize
  setInitial();
})();
