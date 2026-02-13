document.addEventListener("DOMContentLoaded", function(){

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

let selectedPlayer = null;

/* ===== BEZPEČNOSTNÍ KONTROLA ===== */
if(!pitch || !createBtn){
console.error("Některé HTML prvky chybí!");
return;
}

/* ===== POZICE ===== */
function getPositions(f){
return {
"1-4-4-2":[["GK"],["LB","CB","CB","RB"],["LM","CM","CM","RM"],["ST","ST"]],
"1-4-3-3":[["GK"],["LB","CB","CB","RB"],["CM","CM","CM"],["LW","ST","RW"]],
"1-4-2-3-1":[["GK"],["LB","CB","CB","RB"],["CDM","CDM"],["LAM","CAM","RAM"],["ST"]]
}[f];
}

/* ===== VYTVOŘ HRÁČE ===== */
function createPlayer(number,pos,isGK=false){

const player=document.createElement("div");
player.className="player";

const num=document.createElement("div");
num.className="player-number";
num.textContent=isGK?"GK":number;
player.appendChild(num);

const label=document.createElement("div");
label.className="player-label";
label.textContent="Hráč";
player.appendChild(label);

player.addEventListener("click",function(e){
e.stopPropagation();
selectedPlayer=player;
playerNameInput.value=label.textContent;
editModal.style.display="flex";
});

return player;
}

/* ===== GENEROVÁNÍ ===== */
createBtn.addEventListener("click",function(){

pitch.querySelectorAll(".player").forEach(p=>p.remove());
bench.innerHTML="";

const formation=formationSelect.value;
const rows=formation.split("-").map(Number);
const positions=getPositions(formation);

let jersey=2;

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

player.style.position="absolute";
player.style.left=x+"%";
player.style.top=y+"%";

pitch.appendChild(player);
}
});

});

/* ===== ULOŽENÍ ===== */
if(saveBtn){
saveBtn.addEventListener("click",function(){
alert("Uloženo ✔");
});
}

/* ===== EXPORT PNG ===== */
if(exportPngBtn){
exportPngBtn.addEventListener("click",function(){

if(typeof html2canvas==="undefined"){
alert("Chybí html2canvas knihovna!");
return;
}

html2canvas(pitch).then(canvas=>{
const link=document.createElement("a");
link.download="lineup.png";
link.href=canvas.toDataURL();
link.click();
});
});
}

/* ===== EXPORT PDF ===== */
if(exportPdfBtn){
exportPdfBtn.addEventListener("click",async function(){

if(typeof jspdf==="undefined" && !window.jspdf){
alert("Chybí jsPDF knihovna!");
return;
}

const { jsPDF } = window.jspdf;
const pdf=new jsPDF();

const canvas=await html2canvas(pitch);
pdf.addImage(canvas.toDataURL(),"PNG",10,10,180,250);
pdf.save("lineup.pdf");
});
}

/* ===== POTVRZENÍ JMÉNA ===== */
confirmNameBtn.addEventListener("click",function(){

if(!selectedPlayer)return;

const label=selectedPlayer.querySelector(".player-label");
label.textContent=playerNameInput.value.trim()||"Hráč";

editModal.style.display="none";
selectedPlayer=null;
});

});
