document.addEventListener("DOMContentLoaded", () => {

  const pitch = document.getElementById("pitch");
  const bench = document.getElementById("bench");
  const formationSelect = document.getElementById("formationSelect");
  const createBtn = document.getElementById("createBtn");
  const saveBtn = document.getElementById("saveBtn");
  const exportPngBtn = document.getElementById("exportPngBtn");
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const editModal = document.getElementById("editModal");
  const playerNameInput = document.getElementById("playerNameInput");
  const confirmNameBtn = document.getElementById("confirmNameBtn");

  if (!pitch || !createBtn) {
    console.error("Chybí HTML prvky.");
    return;
  }

  let selectedForSwap = null;
  let selectedPlayer = null;

  /* ===== POZICE ===== */
  function getPositions(f) {
    return {
      "1-4-4-2": [["GK"], ["LB","CB","CB","RB"], ["LM","CM","CM","RM"], ["ST","ST"]],
      "1-4-3-3": [["GK"], ["LB","CB","CB","RB"], ["CM","CM","CM"], ["LW","ST","RW"]],
      "1-4-2-3-1": [["GK"], ["LB","CB","CB","RB"], ["CDM","CDM"], ["LAM","CAM","RAM"], ["ST"]]
    }[f] || [];
  }

  /* ===== DRAG ===== */
  function makeDraggable(el) {
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    el.addEventListener("pointerdown", e => {
      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      dragging = true;
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener("pointermove", e => {
      if (!dragging) return;

      const pitchRect = pitch.getBoundingClientRect();

      let x = e.clientX - pitchRect.left - offsetX + el.offsetWidth/2;
      let y = e.clientY - pitchRect.top - offsetY + el.offsetHeight/2;

      x = Math.max(0, Math.min(x, pitchRect.width));
      y = Math.max(0, Math.min(y, pitchRect.height));

      el.style.left = (x / pitchRect.width * 100) + "%";
      el.style.top = (y / pitchRect.height * 100) + "%";
    });

    el.addEventListener("pointerup", () => dragging = false);
  }

  /* ===== VYTVOŘ HRÁČE ===== */
  function createPlayer(number, pos, isGK=false) {

    const player = document.createElement("div");
    player.className = "player";
    player.style.position = "absolute";
    player.style.transform = "translate(-50%, -50%)";
    player.style.touchAction = "none";

    const num = document.createElement("div");
    num.className = "player-number";
    num.textContent = isGK ? "GK" : number;
    player.appendChild(num);

    const posLabel = document.createElement("div");
    posLabel.className = "player-position";
    posLabel.textContent = pos || "";
    player.appendChild(posLabel);

    const nameLabel = document.createElement("div");
    nameLabel.className = "player-label";
    nameLabel.textContent = "Hráč";
    player.appendChild(nameLabel);

    /* STŘÍDÁNÍ */
    player.addEventListener("click", e => {
      e.stopPropagation();

      if (!selectedForSwap) {
        selectedForSwap = player;
        player.style.outline = "3px solid red";
        return;
      }

      if (selectedForSwap === player) {
        player.style.outline = "";
        selectedForSwap = null;
        return;
      }

      ["player-number","player-label","player-position"].forEach(cls => {
        const a = selectedForSwap.querySelector("." + cls).textContent;
        const b = player.querySelector("." + cls).textContent;
        selectedForSwap.querySelector("." + cls).textContent = b;
        player.querySelector("." + cls).textContent = a;
      });

      selectedForSwap.style.outline = "";
      selectedForSwap = null;
    });

    /* EDIT JMÉNA */
    nameLabel.addEventListener("pointerdown", e => {
      e.stopPropagation();
      selectedPlayer = player;
      playerNameInput.value = nameLabel.textContent;
      editModal.style.display = "flex";
    });

    makeDraggable(player);
    return player;
  }

  /* ===== VYTVOŘENÍ SESTAVY ===== */
  createBtn.addEventListener("click", () => {

    pitch.querySelectorAll(".player").forEach(p => p.remove());
    bench.innerHTML = "";
    selectedForSwap = null;

    const formation = formationSelect.value;
    const rows = formation.split("-").map(Number);
    const positions = getPositions(formation);

    let jersey = 2;

    rows.forEach((count,rowIndex) => {
      for (let i=0;i<count;i++) {

        let player;

        if (rowIndex===0 && count===1) {
          player = createPlayer(null,"GK",true);
        } else {
          player = createPlayer(jersey,positions[rowIndex]?.[i]);
          jersey++;
        }

        const y = 100 - ((rowIndex+1)*(100/(rows.length+1)));
        const x = (i+1)*(100/(count+1));

        player.style.left = x + "%";
        player.style.top = y + "%";

        pitch.appendChild(player);
      }
    });

    /* LAVIČKA */
    for (let i=jersey;i<=16;i++) {
      const b = document.createElement("div");
      b.className = "bench-player";
      b.textContent = i;

      b.addEventListener("click", () => {
        if (!selectedForSwap) return;

        const temp = selectedForSwap.querySelector(".player-number").textContent;
        selectedForSwap.querySelector(".player-number").textContent = b.textContent;
        b.textContent = temp;

        selectedForSwap.style.outline = "";
        selectedForSwap = null;
      });

      bench.appendChild(b);
    }

  });

  /* ===== POTVRZENÍ JMÉNA ===== */
  confirmNameBtn.addEventListener("click", () => {
    if (!selectedPlayer) return;

    selectedPlayer.querySelector(".player-label").textContent =
      playerNameInput.value.trim() || "Hráč";

    editModal.style.display = "none";
    playerNameInput.value = "";
    selectedPlayer = null;
  });

  /* ===== ULOŽENÍ ===== */
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      alert("Sestava uložena ✔");
    });
  }

});

/* =========================
   EXPORT PNG
========================= */
if (exportPngBtn) {
  exportPngBtn.addEventListener("click", async () => {

    if (typeof html2canvas === "undefined") {
      alert("html2canvas se nenačetl.");
      return;
    }

    try {

      const canvas = await html2canvas(pitch, {
        backgroundColor: "#1b5e20",
        scale: 2
      });

      const link = document.createElement("a");
      link.download = "lineup.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

    } catch (err) {
      console.error(err);
      alert("Chyba při exportu PNG.");
    }

  });
}

/* =========================
   EXPORT PDF
========================= */
if (exportPdfBtn) {
  exportPdfBtn.addEventListener("click", async () => {

    if (!window.jspdf) {
      alert("jsPDF se nenačetl.");
      return;
    }

    try {

      const { jsPDF } = window.jspdf;

      const canvas = await html2canvas(pitch, {
        backgroundColor: "#1b5e20",
        scale: 2
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("portrait", "mm", "a4");

      const pageWidth = 190;
      const pageHeight = 260;

      pdf.addImage(imgData, "PNG", 10, 10, pageWidth, pageHeight);
      pdf.save("lineup.pdf");

    } catch (err) {
      console.error(err);
      alert("Chyba při exportu PDF.");
    }

  });
}

