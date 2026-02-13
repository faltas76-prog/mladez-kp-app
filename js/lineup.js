document.addEventListener("DOMContentLoaded", () => {

  const pitch = document.getElementById("pitch");
  const formationSelect = document.getElementById("formationSelect");
  const createBtn = document.getElementById("createBtn");
  const editModal = document.getElementById("editModal");
  const playerNameInput = document.getElementById("playerNameInput");
  const confirmNameBtn = document.getElementById("confirmNameBtn");

  let selectedPlayer = null;

  /* ========================
     POZICE PODLE FORMACE
  ======================== */
  function getPositions(formation) {

    const map = {
      "1-4-4-2": [
        ["GK"],
        ["LB","CB","CB","RB"],
        ["LM","CM","CM","RM"],
        ["ST","ST"]
      ],
      "1-4-3-3": [
        ["GK"],
        ["LB","CB","CB","RB"],
        ["CM","CM","CM"],
        ["LW","ST","RW"]
      ],
      "1-4-2-3-1": [
        ["GK"],
        ["LB","CB","CB","RB"],
        ["CDM","CDM"],
        ["LAM","CAM","RAM"],
        ["ST"]
      ]
    };

    return map[formation] || [];
  }

  /* ========================
     VYTVOŘ HRÁČE
  ======================== */
  function createPlayer(number, position, isGK = false) {

  const player = document.createElement("div");
  player.className = "player";

  /* ===== ČÍSLO ===== */
  const numberEl = document.createElement("div");
  numberEl.className = "player-number";
  numberEl.textContent = isGK ? "GK" : number;
  player.appendChild(numberEl);

  if (isGK) {
    player.style.background = "#ffcc00";
  }

  /* ===== POZICE ===== */
  const pos = document.createElement("div");
  pos.className = "player-position";
  pos.textContent = position || "";
  player.appendChild(pos);

  /* ===== JMÉNO ===== */
  const label = document.createElement("div");
  label.className = "player-label";
  label.textContent = "Hráč";
  player.appendChild(label);

  /* ===== KAPITÁN ===== */
  player.addEventListener("dblclick", () => {
    document.querySelectorAll(".captain").forEach(p => p.classList.remove("captain"));
    player.classList.add("captain");
  });

  /* ===== EDIT ===== */
  player.addEventListener("click", (e) => {
    e.stopPropagation();
    selectedPlayer = label;
    playerNameInput.value = label.textContent;
    editModal.style.display = "flex";
  });

  makeDraggable(player);

  return player;
}


  /* ========================
     GENEROVÁNÍ ROZESTAVENÍ
  ======================== */
  createBtn.addEventListener("click", () => {

    pitch.querySelectorAll(".player").forEach(p => p.remove());

    const formation = formationSelect.value;
    const rows = formation.split("-").map(Number);
    const positions = getPositions(formation);

    let jersey = 2;

    rows.forEach((count, rowIndex) => {

      for (let i = 0; i < count; i++) {

        let player;

        if (rowIndex === 0 && count === 1) {
          player = createPlayer(null, "GK", true);
        } else {
          const pos = positions[rowIndex]?.[i] || "";
          player = createPlayer(jersey, pos);
          jersey++;
        }

        const yPercent = 100 - ((rowIndex + 1) * (100 / (rows.length + 1)));
        const xPercent = ((i + 1) * (100 / (count + 1)));

        player.style.left = xPercent + "%";
        player.style.top = yPercent + "%";
        player.style.transform = "translate(-50%, -50%)";

        pitch.appendChild(player);
      }
    });

  });

  /* ========================
     DRAG
  ======================== */
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

  /* ========================
     POTVRZENÍ JMÉNA
  ======================== */
  confirmNameBtn.addEventListener("click", () => {
    if (selectedPlayer) {
      selectedPlayer.textContent = playerNameInput.value || "Hráč";
    }
    editModal.style.display = "none";
  });

});
