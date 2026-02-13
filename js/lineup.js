document.addEventListener("DOMContentLoaded", () => {

  const pitch = document.getElementById("pitch");
  const formationSelect = document.getElementById("formationSelect");
  const createBtn = document.getElementById("createBtn");
  const exportBtn = document.getElementById("exportBtn");
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const saveBtn = document.getElementById("saveBtn");

  const bench = document.getElementById("bench");

  const editModal = document.getElementById("editModal");
  const playerNameInput = document.getElementById("playerNameInput");
  const confirmNameBtn = document.getElementById("confirmNameBtn");

  let selectedLabel = null;

  /* =========================
     VYTVOŘ HRÁČE
  ========================== */
  function createPlayer(number, isGK = false) {

    const player = document.createElement("div");
    player.className = "player";

    player.textContent = isGK ? "GK" : number;

    if (isGK) player.style.background = "#ffcc00";

    const label = document.createElement("div");
    label.className = "player-label";
    label.textContent = "Hráč";

    player.appendChild(label);

    makeDraggable(player);

    player.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedLabel = label;
      playerNameInput.value = label.textContent;
      editModal.style.display = "flex";
    });

    return player;
  }

  /* =========================
     ROZESTAVENÍ
  ========================== */
  createBtn.addEventListener("click", () => {

    pitch.querySelectorAll(".player").forEach(p => p.remove());
    bench.innerHTML = "";

    const rows = formationSelect.value.split("-").map(Number);

    let jerseyNumber = 2;

    rows.forEach((count, rowIndex) => {

      for (let i = 0; i < count; i++) {

        let player;

        if (rowIndex === 0 && count === 1) {
          player = createPlayer(null, true);
        } else {
          player = createPlayer(jerseyNumber);
          jerseyNumber++;
          if (jerseyNumber > 16) jerseyNumber = 16;
        }

        const yPercent = 100 - ((rowIndex + 1) * (100 / (rows.length + 1)));
        const xPercent = ((i + 1) * (100 / (count + 1)));

        player.style.left = xPercent + "%";
        player.style.top = yPercent + "%";
        player.style.transform = "translate(-50%, -50%)";

        pitch.appendChild(player);
      }
    });

    /* vytvoř lavičku */
    for (let i = jerseyNumber; i <= 16; i++) {

      const benchPlayer = document.createElement("div");
      benchPlayer.className = "bench-player";
      benchPlayer.textContent = i;

      benchPlayer.addEventListener("click", () => {
        const newPlayer = createPlayer(i);
        newPlayer.style.left = "50%";
        newPlayer.style.top = "50%";
        newPlayer.style.transform = "translate(-50%, -50%)";
        pitch.appendChild(newPlayer);
      });

      bench.appendChild(benchPlayer);
    }

  });

  /* =========================
     DRAG
  ========================== */
  function makeDraggable(el) {

    el.addEventListener("pointerdown", e => {
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener("pointermove", e => {
      if (e.buttons !== 1) return;

      const rect = pitch.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      el.style.left = x + "%";
      el.style.top = y + "%";
      el.style.transform = "translate(-50%, -50%)";
    });
  }

  /* =========================
     EDIT JMÉNA
  ========================== */
  confirmNameBtn.addEventListener("click", () => {
    if (selectedLabel) {
      selectedLabel.textContent = playerNameInput.value || "Hráč";
    }
    editModal.style.display = "none";
  });

  /* =========================
     ULOŽENÍ
  ========================== */
  saveBtn.addEventListener("click", () => {

    const data = [];

    document.querySelectorAll(".player").forEach(p => {
      data.push({
        number: p.firstChild.textContent,
        name: p.querySelector(".player-label").textContent,
        x: p.style.left,
        y: p.style.top
      });
    });

    localStorage.setItem("MATCH_LINEUP", JSON.stringify(data));
    alert("Sestava uložena ✔");
  });

  /* =========================
     EXPORT PNG
  ========================== */
  exportBtn.addEventListener("click", () => {
    html2canvas(pitch).then(canvas => {
      const link = document.createElement("a");
      link.download = "rozestaveni.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  });

  /* =========================
     EXPORT PDF
  ========================== */
  exportPdfBtn.addEventListener("click", async () => {

    const { jsPDF } = window.jspdf;
    const canvas = await html2canvas(pitch);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 180, 250);
    pdf.save("rozestaveni.pdf");
  });

});
