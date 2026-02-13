document.addEventListener("DOMContentLoaded", function () {

  const pitch = document.getElementById("pitch");
  const formationSelect = document.getElementById("formationSelect");
  const createBtn = document.getElementById("createBtn");
  const editModal = document.getElementById("editModal");
  const playerNameInput = document.getElementById("playerNameInput");
  const confirmNameBtn = document.getElementById("confirmNameBtn");
  const exportPngBtn = document.getElementById("exportPngBtn");
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const bench = document.getElementById("bench");
 
  let selectedForSwap = null;
  let selectedPlayer = null;

  /* ===== POZICE ===== */
  function getPositions(f) {
    return {
      "1-4-4-2": [["GK"], ["LB","CB","CB","RB"], ["LM","CM","CM","RM"], ["ST","ST"]],
      "1-4-3-3": [["GK"], ["LB","CB","CB","RB"], ["CM","CM","CM"], ["LW","ST","RW"]],
      "1-4-2-3-1": [["GK"], ["LB","CB","CB","RB"], ["CDM","CDM"], ["LAM","CAM","RAM"], ["ST"]]
    }[f];
  }

  /* ===== VYTVOŘ HRÁČE ===== */
  function createPlayer(number, position, isGK = false) {

    const player = document.createElement("div");
    player.className = "player";

    const num = document.createElement("div");
    num.className = "player-number";
    num.textContent = isGK ? "GK" : number;
    player.appendChild(num);

    const pos = document.createElement("div");
    pos.className = "player-position";
    pos.textContent = position || "";
    player.appendChild(pos);

    const label = document.createElement("div");
    label.className = "player-label";
    label.textContent = "Hráč";
    player.appendChild(label);

    /* ===== OTEVŘÍT MODAL ===== */
   player.addEventListener("click", function(e){
e.stopPropagation();

/* pokud klikneš na hráče → vybere se */
if(!selectedForSwap){
selectedForSwap=player;
player.style.outline="3px solid red";
return;
}

/* pokud klikneš na jiného hráče → swap */
if(selectedForSwap!==player){

["player-number","player-label","player-position"].forEach(cls=>{
const a=selectedForSwap.querySelector("."+cls).textContent;
const b=player.querySelector("."+cls).textContent;

selectedForSwap.querySelector("."+cls).textContent=b;
player.querySelector("."+cls).textContent=a;
});
}

selectedForSwap.style.outline="none";
selectedForSwap=null;
});


  /* ===== GENEROVÁNÍ ===== */
  createBtn.addEventListener("click",function(){

pitch.querySelectorAll(".player").forEach(p=>p.remove());
bench.innerHTML="";
selectedForSwap=null;

const formation=formationSelect.value;
const rows=formation.split("-").map(Number);
const positions=getPositions(formation);

let jersey=2;

/* HRÁČI NA HŘIŠTI */
rows.forEach((count,rowIndex)=>{
for(let i=0;i<count;i++){

let player;

if(rowIndex===0 && count===1){
player=createPlayer(null,"GK",true);
}else{
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

/* LAVIČKA 12–16 */
for(let i=jersey;i<=16;i++){
const benchPlayer=document.createElement("div");
benchPlayer.className="bench-player";
benchPlayer.textContent=i;

benchPlayer.addEventListener("click",function(){

if(!selectedForSwap)return;

const fieldNumberEl=selectedForSwap.querySelector(".player-number");
const temp=fieldNumberEl.textContent;

fieldNumberEl.textContent=benchPlayer.textContent;
benchPlayer.textContent=temp;

selectedForSwap.style.outline="none";
selectedForSwap=null;
});

bench.appendChild(benchPlayer);
}

});

  /* ===== DRAG ===== */
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
    });
  }

  /* ===== POTVRZENÍ JMÉNA ===== */
  confirmNameBtn.addEventListener("click", function () {

    if (!selectedPlayer) return;

    const label = selectedPlayer.querySelector(".player-label");
    label.textContent = playerNameInput.value.trim() || "Hráč";

    editModal.style.display = "none";
    selectedPlayer = null;
  });

});
/* ===== EXPORT PNG ===== */
exportPngBtn.addEventListener("click", function(){

  html2canvas(pitch).then(canvas=>{
    const link=document.createElement("a");
    link.download="lineup.png";
    link.href=canvas.toDataURL();
    link.click();
  });

});

/* ===== EXPORT PDF ===== */
exportPdfBtn.addEventListener("click", async function(){

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("portrait","mm","a4");

  const canvas = await html2canvas(pitch);
  const imgData = canvas.toDataURL("image/png");

  pdf.addImage(imgData,"PNG",10,10,190,270);
  pdf.save("lineup.pdf");

});
