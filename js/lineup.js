document.addEventListener("DOMContentLoaded", function () {

  console.log("Lineup JS loaded");

  const pitch = document.getElementById("pitch");
  const bench = document.getElementById("bench");
  const formationSelect = document.getElementById("formationSelect");
  const createBtn = document.getElementById("createBtn");
  const saveBtn = document.getElementById("saveBtn");
  const exportPngBtn = document.getElementById("exportPngBtn");
  const exportPdfBtn = document.getElementById("exportPdfBtn");

  if (!pitch || !createBtn) {
    console.error("Chybí HTML prvky – zkontroluj ID.");
    return;
  }

  let selectedForSwap = null;

  /* ================= POZICE ================= */
  function getPositions(f) {
    return {
      "1-4-4-2": [["GK"], ["LB","CB","CB","RB"], ["LM","CM","CM","RM"], ["ST","ST"]],
      "1-4-3-3": [["GK"], ["LB","CB","CB","RB"], ["CM","CM","CM"], ["LW","ST","RW"]],
      "1-4-2-3-1": [["GK"], ["LB","CB","CB","RB"], ["CDM","CDM"], ["LAM","CAM","RAM"], ["ST"]]
    }[f] || [];
  }

  /* ================= DRAG ================= */
  function makeDraggable(el) {

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    el.addEventListener("pointerdown", function (e) {
      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      dragging = true;
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;

      const pitchRect = pitch.getBoundingClientRect();

      let x = e.clientX - pitchRect.left - offsetX + el.offsetWidth/2;
      let y = e.clientY - pitchRect.top - offsetY + el.offsetHeight/2;

      x = Math.max(0, Math.min(x, pitchRect.width));
      y = Math.max(0, Math.min(y, pitchRect.height));

      el.style.left = (x / pitchRect.width * 100) + "%";
      el.style.top = (y / pitchRect.height * 100) + "%";
    });

    el.addEventListener("pointerup", function () {
      dragging = false;
    });
  }

  /* ================= VYTVOŘ HRÁČE ================= */
  function createPlayer(number, pos, isGK = false) {

    const player = document.createElement("div");
    player.className = "player";
    player.style.position = "absolute";
    player.style.transform = "translate(-50%, -50%)";
    player.style.touchAction = "none";

    const num = document.createElement("div");
    num.className = "player-number";
    num.textContent = isGK ? "GK" : number;
    player.appendChild(num);

    const name = document.createElement("div");
    name.className = "player-label";
    name.textContent = "Hráč";
    player.appendChild(name);

    /* STŘÍDÁNÍ */
    player.addEventListener("click", function (e) {
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

      const a = selectedForSwap.querySelector(".player-number").textContent;
      const b = player.querySelector(".player-number").textContent;

      selectedForSwap.querySelector(".player-number").textContent = b;
      player.querySelector(".player-number").textContent = a;

      selectedForSwap.style.outline = "";
      selectedForSwap = null;
    });

    makeDraggable(player);
    return player;
  }

  /* ================= VYTVOŘIT ================= */
  createBtn.addEventListener("click", function () {

  pitch.querySelectorAll(".player").forEach(p => p.remove());
  bench.innerHTML = "";
  selectedForSwap = null;

  const formation = formationSelect.value;
  const rows = formation.split("-").map(Number);
  const positions = getPositions(formation);

  let jersey = 2;

  /* ===== HRÁČI NA HŘIŠTI ===== */
  rows.forEach((count,rowIndex) => {
    for (let i = 0; i < count; i++) {

      let player;

      if (rowIndex === 0 && count === 1) {
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

  /* ===== LAVIČKA ===== */
  confirmNameBtn.addEventListener("click", function(){

  if(!selectedPlayer) return;

  // hráč na hřišti
  if(selectedPlayer.classList.contains("player")){
    selectedPlayer.querySelector(".player-label").textContent =
      playerNameInput.value.trim() || "Hráč";
  }

  // náhradník
  if(selectedPlayer.classList.contains("bench-player")){
    selectedPlayer.querySelector(".bench-name").textContent =
      playerNameInput.value.trim() || "Hráč";
  }

  editModal.style.display = "none";
  playerNameInput.value = "";
  selectedPlayer = null;
});

    for (let i = jersey; i <= 16; i++) {

    const benchPlayer = document.createElement("div");
    benchPlayer.className = "bench-player";

    benchPlayer.innerHTML = `
      <div class="bench-number">${i}</div>
      <div class="bench-name">Hráč</div>
    `;

    /* EDIT JMÉNA NÁHRADNÍKA */
    const nameEl = benchPlayer.querySelector(".bench-name");

    nameEl.addEventListener("pointerdown", function(e){
      e.stopPropagation();
      selectedPlayer = benchPlayer;
      playerNameInput.value = nameEl.textContent;
      editModal.style.display = "flex";
    });

    /* STŘÍDÁNÍ */
    benchPlayer.addEventListener("click", function(){

      if(!selectedForSwap) return;

      const fieldNumber = selectedForSwap.querySelector(".player-number");
      const fieldName = selectedForSwap.querySelector(".player-label");

      const benchNumber = benchPlayer.querySelector(".bench-number");
      const benchName = benchPlayer.querySelector(".bench-name");

      // swap čísla
      const tempNumber = fieldNumber.textContent;
      fieldNumber.textContent = benchNumber.textContent;
      benchNumber.textContent = tempNumber;

      // swap jména
      const tempName = fieldName.textContent;
      fieldName.textContent = benchName.textContent;
      benchName.textContent = tempName;

      selectedForSwap.style.outline = "";
      selectedForSwap = null;
    });

    bench.appendChild(benchPlayer);
  }

});


  /* ================= PNG ================= */
  if (exportPngBtn) {
    exportPngBtn.addEventListener("click", async function () {

      if (typeof html2canvas === "undefined") {
        alert("html2canvas není načten.");
        return;
      }

      const canvas = await html2canvas(pitch, {
        backgroundColor: "#1b5e20"
      });

      const link = document.createElement("a");
      link.download = "lineup.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  /* ================= PDF ================= */
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", async function () {

      if (!window.jspdf) {
        alert("jsPDF není načten.");
        return;
      }

      const { jsPDF } = window.jspdf;
      const canvas = await html2canvas(pitch, {
        backgroundColor: "#1b5e20"
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("portrait","mm","a4");
      pdf.addImage(imgData,"PNG",10,10,190,260);
      pdf.save("lineup.pdf");
    });
  }

});
