document.addEventListener("DOMContentLoaded", function(){

  const pitch = document.getElementById("pitch");
  const bench = document.getElementById("bench");
  const formationSelect = document.getElementById("formationSelect");
  const createBtn = document.getElementById("createBtn");
  const saveBtn = document.getElementById("saveBtn");
  const editModal = document.getElementById("editModal");
  const playerNameInput = document.getElementById("playerNameInput");
  const confirmNameBtn = document.getElementById("confirmNameBtn");

  let selectedForSwap = null;
  let selectedForEdit = null;

  if(!pitch || !createBtn){
    console.error("Chybí HTML prvky.");
    return;
  }

  /* ================= POZICE ================= */
  function getPositions(f){
    return {
      "1-4-4-2":[["GK"],["LB","CB","CB","RB"],["LM","CM","CM","RM"],["ST","ST"]],
      "1-4-3-3":[["GK"],["LB","CB","CB","RB"],["CM","CM","CM"],["LW","ST","RW"]],
      "1-4-2-3-1":[["GK"],["LB","CB","CB","RB"],["CDM","CDM"],["LAM","CAM","RAM"],["ST"]]
    }[f] || [];
  }

  /* ================= DRAG ================= */
  function makeDraggable(el){

    let dragging=false;
    let offsetX=0;
    let offsetY=0;

    el.addEventListener("pointerdown", function(e){
      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      dragging=true;
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
      dragging=false;
    });
  }

  /* ================= VYTVOŘ HRÁČE ================= */
  function createPlayer(number, position, isGK=false){

    const player = document.createElement("div");
    player.className="player";
    player.style.position="absolute";
    player.style.transform="translate(-50%,-50%)";
    player.style.touchAction="none";

    const num = document.createElement("div");
    num.className="player-number";
    num.textContent = isGK ? "GK" : number;
    player.appendChild(num);

    const pos = document.createElement("div");
    pos.className="player-position";
    pos.textContent = position || "";
    player.appendChild(pos);

    const name = document.createElement("div");
    name.className="player-label";
    name.textContent="Hráč";
    player.appendChild(name);

    /* STŘÍDÁNÍ */
    player.addEventListener("click", function(e){
      e.stopPropagation();

      if(!selectedForSwap){
        selectedForSwap=player;
        player.style.outline="3px solid red";
        return;
      }

      if(selectedForSwap===player){
        player.style.outline="";
        selectedForSwap=null;
        return;
      }

      ["player-number","player-label","player-position"].forEach(cls=>{
        const a = selectedForSwap.querySelector("."+cls).textContent;
        const b = player.querySelector("."+cls).textContent;

        selectedForSwap.querySelector("."+cls).textContent=b;
        player.querySelector("."+cls).textContent=a;
      });

      selectedForSwap.style.outline="";
      selectedForSwap=null;
    });

    /* EDITACE JMÉNA */
    name.addEventListener("pointerdown", function(e){
      e.stopPropagation();
      selectedForEdit=player;
      playerNameInput.value=name.textContent;
      editModal.style.display="flex";
    });

    makeDraggable(player);
    return player;
  }

  /* ================= VYTVOŘ SESTAVU ================= */
  createBtn.addEventListener("click", function(){

    pitch.querySelectorAll(".player").forEach(p=>p.remove());
    bench.innerHTML="";
    selectedForSwap=null;

    const formation = formationSelect.value;
    const rows = formation.split("-").map(Number);
    const positions = getPositions(formation);

    let jersey=2;

    rows.forEach((count,rowIndex)=>{
      for(let i=0;i<count;i++){

        let player;

        if(rowIndex===0 && count===1){
          player=createPlayer(null,"GK",true);
        } else {
          player=createPlayer(jersey,positions[rowIndex]?.[i]);
          jersey++;
        }

        const y=100-((rowIndex+1)*(100/(rows.length+1)));
        const x=(i+1)*(100/(count+1));

        player.style.left=x+"%";
        player.style.top=y+"%";

        pitch.appendChild(player);
      }
    });

    /* LAVIČKA */
    for(let i=jersey;i<=16;i++){

      const b=document.createElement("div");
      b.className="bench-player";
      b.innerHTML=`
        <div class="bench-number">${i}</div>
        <div class="bench-name">Hráč</div>
      `;

      const benchName=b.querySelector(".bench-name");

      benchName.addEventListener("pointerdown", function(e){
        e.stopPropagation();
        selectedForEdit=b;
        playerNameInput.value=benchName.textContent;
        editModal.style.display="flex";
      });

      b.addEventListener("click", function(){

        if(!selectedForSwap) return;

        const fieldNumber=selectedForSwap.querySelector(".player-number");
        const fieldName=selectedForSwap.querySelector(".player-label");

        const benchNumber=b.querySelector(".bench-number");

        const tempNumber=fieldNumber.textContent;
        fieldNumber.textContent=benchNumber.textContent;
        benchNumber.textContent=tempNumber;

        const tempName=fieldName.textContent;
        fieldName.textContent=benchName.textContent;
        benchName.textContent=tempName;

        selectedForSwap.style.outline="";
        selectedForSwap=null;
      });

      bench.appendChild(b);
    }

  });

  /* ================= POTVRZENÍ JMÉNA ================= */
  confirmNameBtn.addEventListener("click", function(){

    if(!selectedForEdit) return;

    if(selectedForEdit.classList.contains("player")){
      selectedForEdit.querySelector(".player-label").textContent=
        playerNameInput.value.trim() || "Hráč";
    }

    if(selectedForEdit.classList.contains("bench-player")){
      selectedForEdit.querySelector(".bench-name").textContent=
        playerNameInput.value.trim() || "Hráč";
    }

    editModal.style.display="none";
    playerNameInput.value="";
    selectedForEdit=null;
  });

  /* ================= ULOŽIT ================= */
  if(saveBtn){
    saveBtn.addEventListener("click", function(){
      alert("Sestava uložena ✔");
    });
  }

});
/* ================= EXPORT PNG ================= */
if (exportPngBtn) {
  exportPngBtn.addEventListener("click", async () => {

    if (typeof html2canvas === "undefined") {
      alert("html2canvas není načten.");
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

/* ================= EXPORT PDF ================= */
if (exportPdfBtn) {
  exportPdfBtn.addEventListener("click", async () => {

    if (!window.jspdf) {
      alert("jsPDF není načten.");
      return;
    }

    try {
      const { jsPDF } = window.jspdf;

      const canvas = await html2canvas(pitch, {
        backgroundColor: "#1b5e20",
        scale: 2
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("portrait","mm","a4");
      pdf.addImage(imgData,"PNG",10,10,190,260);
      pdf.save("lineup.pdf");

    } catch (err) {
      console.error(err);
      alert("Chyba při exportu PDF.");
    }
  });
}
