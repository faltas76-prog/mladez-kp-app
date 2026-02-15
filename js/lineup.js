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

  let selectedForSwap = null;
  let selectedPlayer = null;

  function getPositions(f) {
    return {
      "1-4-4-2": [["GK"], ["LB","CB","CB","RB"], ["LM","CM","CM","RM"], ["ST","ST"]],
      "1-4-3-3": [["GK"], ["LB","CB","CB","RB"], ["CM","CM","CM"], ["LW","ST","RW"]],
      "1-4-2-3-1": [["GK"], ["LB","CB","CB","RB"], ["CDM","CDM"], ["LAM","CAM","RAM"], ["ST"]]
    }[f] || [];
  }

  function createPlayer(number, pos, isGK = false) {
    const player = document.createElement("div");
    player.className = "player";

    const num = document.createElement("div");
    num.className = "player-number";
    num.textContent = isGK ? "GK" : number;
    player.appendChild(num);

    const positionLabel = document.createElement("div");
    positionLabel.className = "player-position";
    positionLabel.textContent = pos || "";
    player.appendChild(positionLabel);

    const nameLabel = document.createElement("div");
    nameLabel.className = "player-label";
    nameLabel.textContent = "Hráč";
    player.appendChild(nameLabel);

    function makeDraggable(el){

  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;

  el.addEventListener("pointerdown", function(e){

    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    dragging = true;
    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener("pointermove", function(e){

    if(!dragging) return;

    const pitchRect = pitch.getBoundingClientRect();

    let x = e.clientX - pitchRect.left - offsetX + el.offsetWidth/2;
    let y = e.clientY - pitchRect.top - offsetY + el.offsetHeight/2;

    x = Math.max(0, Math.min(x, pitchRect.width));
    y = Math.max(0, Math.min(y, pitchRect.height));

    el.style.left = (x / pitchRect.width * 100) + "%";
    el.style.top  = (y / pitchRect.height * 100) + "%";
  });

  el.addEventListener("pointerup", function(){
    dragging = false;
  });
}


    // Klik pro výběr hráče ke střídání
    player.addEventListener("click", (e) => {
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

      // swap
      const props = ["player-number","player-label","player-position"];
      props.forEach(cls => {
        const t1 = selectedForSwap.querySelector("."+cls).textContent;
        const t2 = player.querySelector("."+cls).textContent;

        selectedForSwap.querySelector("."+cls).textContent = t2;
        player.querySelector("."+cls).textContent = t1;
      });

      selectedForSwap.style.outline = "";
      selectedForSwap = null;
    });

    // edit jména (pravý klik)
    nameLabel.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      selectedPlayer = player;
      playerNameInput.value = nameLabel.textContent;
      editModal.style.display = "flex";
    });
    makeDraggable(player);
    return player;
  }

  createBtn.addEventListener("click", () => {
    pitch.querySelectorAll(".player").forEach(p => p.remove());
    bench.innerHTML = "";
    selectedForSwap = null;

    const formation = formationSelect.value;
    const rows = formation.split("-").map(Number);
    const positions = getPositions(formation);

    let jersey = 2;

    rows.forEach((count,rowIndex) => {
      for (let i=0; i<count; i++) {
        let player;

        if (rowIndex===0 && count===1) {
          player = createPlayer(null, "GK", true);
        } else {
          player = createPlayer(jersey, positions[rowIndex]?.[i]);
          jersey++;
        }

        const y = 100 - ((rowIndex+1)*(100/(rows.length+1)));
        const x = (i+1)*(100/(count+1));

        player.style.position = "absolute";
        player.style.left = x + "%";
        player.style.top = y + "%";

        pitch.appendChild(player);
      }
    });

    // lavička
    for (let i=jersey; i<=16; i++) {
      const b = document.createElement("div");
      b.className = "bench-player";
      b.textContent = i;

      b.addEventListener("click", () => {
        if (!selectedForSwap) return;

        const swapNumber = selectedForSwap.querySelector(".player-number").textContent;
        selectedForSwap.querySelector(".player-number").textContent = b.textContent;
        b.textContent = swapNumber;

        selectedForSwap.style.outline = "";
        selectedForSwap = null;
      });

      bench.appendChild(b);
    }
  });

  confirmNameBtn.addEventListener("click", () => {
    if (!selectedPlayer) return;
    selectedPlayer.querySelector(".player-label").textContent =
      playerNameInput.value.trim() || "Hráč";
    editModal.style.display = "none";
    selectedPlayer = null;
  });

  saveBtn.addEventListener("click", () => {
    const data = [];
    pitch.querySelectorAll(".player").forEach(p => {
      data.push({
        number: p.querySelector(".player-number").textContent,
        position: p.querySelector(".player-position").textContent,
        name: p.querySelector(".player-label").textContent,
        left: p.style.left,
        top: p.style.top
      });
    });
    localStorage.setItem("lineup_data", JSON.stringify(data));
    alert("Uloženo ✔");
  });

  exportPngBtn.addEventListener("click", () => {
    html2canvas(pitch).then(canvas => {
      const link = document.createElement("a");
      link.download = "lineup.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  });

  exportPdfBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation:"portrait" });
    const canvas = await html2canvas(pitch);
    pdf.addImage(canvas.toDataURL(), "PNG", 10, 10, 190, 270);
    pdf.save("lineup.pdf");
  });

});
