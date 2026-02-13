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

  const logoUpload = document.getElementById("logoUpload");

  let selectedLabel = null;
  let selectedForSwap = null;
  let teamLogo = null;

  /* =======================
     POZICE MAPA
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

  /* =======================
     VYTVOŘ HRÁČE
  ======================== */
  function createPlayer(number, position, isGK = false) {

    const player = document.createElement("div");
    player.className = "player";

    /* ČÍSLO */
    const numberEl = document.createElement("div");
    numberEl.className = "player-number";
    numberEl.textContent = isGK ? "GK" : number;
    player.appendChild(numberEl);

    if (isGK) player.style.background = "#ffcc00";

    /* POZICE */
    const pos = document.createElement("div");
    pos.className = "player-position";
    pos.textContent = position || "";
    player.appendChild(pos);

    /* JMÉNO */
    const label = document.createElement("div");
    label.className = "player-label";
    label.textContent = "Hráč";
    player.appendChild(label);

    /* KAPITÁN */
    player.addEventListener("dblclick", () => {
      document.querySelectorAll(".captain").forEach(p => p.classList.remove("captain"));
      player.classList.add("captain");
    });

    /* EDITACE JMÉNA */
   player.addEventListener("click", (e) => {
  e.stopPropagation();

  // Pokud už je vybraný jiný hráč → zruš výběr
  document.querySelectorAll(".player").forEach(p => {
    p.style.outline = "none";
  });

  selectedForSwap = player;
  player.style.outline = "3px solid red";
});


  // CTRL + klik = střídání
  if (e.ctrlKey) {
    if (!selectedForSwap) {
      selectedForSwap = player;
      player.style.outline = "3px solid red";
    } else if (selectedForSwap === player) {
      player.style.outline = "none";
      selectedForSwap = null;
    }
    return;
  }

  // Normální klik = editace jména
  selectedLabel = player.querySelector(".player-label");
  playerNameInput.value = selectedLabel.textContent;
  editModal.style.display = "flex";
});

    makeDraggable(player);

    return player;
  }

  /* =======================
     ROZESTAVENÍ
  ======================== */
  createBtn.addEventListener("click", () => {

    pitch.querySelectorAll(".player").forEach(p => p.remove());
    bench.innerHTML = "";
    selectedForSwap = null;

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
          player = createPlayer(jersey, positions[rowIndex]?.[i]);
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

    /* LAVIČKA */
    for (let i = jersey; i <= 16; i++) {

      const benchPlayer = document.createElement("div");
      benchPlayer.className = "bench-player";
      benchPlayer.textContent = i;

      benchPlayer.addEventListener("click", () => {

        if (!selectedForSwap) return;

        const fieldNumber = selectedForSwap.querySelector(".player-number");
        const temp = fieldNumber.textContent;

        fieldNumber.textContent = benchPlayer.textContent;
        benchPlayer.textContent = temp;

        selectedForSwap.style.outline = "none";
        selectedForSwap = null;
      });

      bench.appendChild(benchPlayer);
    }
  });

  /* =======================
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

  /* =======================
     EDITACE POTVRZENÍ
  ======================== */
  confirmNameBtn.addEventListener("click", () => {
    if (selectedLabel) {
      selectedLabel.textContent = playerNameInput.value || "Hráč";
    }
    editModal.style.display = "none";
  });

  /* =======================
     ULOŽENÍ
  ======================== */
  saveBtn.addEventListener("click", () => {

    const data = [];

    document.querySelectorAll(".player").forEach(p => {
      data.push({
        number: p.querySelector(".player-number").textContent,
        position: p.querySelector(".player-position").textContent,
        name: p.querySelector(".player-label").textContent,
        x: p.style.left,
        y: p.style.top
      });
    });

    localStorage.setItem("MATCH_LINEUP", JSON.stringify(data));
    alert("Sestava uložena ✔");
  });

  /* =======================
     EXPORT PNG
  ======================== */
  exportBtn.addEventListener("click", () => {
    html2canvas(pitch).then(canvas => {
      const link = document.createElement("a");
      link.download = "rozestaveni.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  });

  /* =======================
     LOGO
  ======================== */
  if (logoUpload) {
    logoUpload.addEventListener("change", function(e){
      const reader = new FileReader();
      reader.onload = function(event) {
        teamLogo = event.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    });
  }

  /* =======================
     EXPORT A4 PDF
  ======================== */
  exportPdfBtn.addEventListener("click", async () => {

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("portrait", "mm", "a4");

    if (teamLogo) {
      pdf.addImage(teamLogo, "PNG", 80, 10, 50, 30);
    }

    pdf.setFontSize(16);
    pdf.text("Match Lineup", 105, 50, { align: "center" });

    const canvas = await html2canvas(pitch);
    const imgData = canvas.toDataURL("image/png");

    pdf.addImage(imgData, "PNG", 10, 60, 190, 220);

    pdf.save("Match_Lineup_A4.pdf");
  });

});
