document.addEventListener("DOMContentLoaded", function(){

const pitch = document.getElementById("pitch");
const bench = document.getElementById("bench");
const formationSelect = document.getElementById("formationSelect");
const createBtn = document.getElementById("createBtn");
const saveBtn = document.getElementById("saveBtn");
const exportBtn = document.getElementById("exportBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const editModal = document.getElementById("editModal");
const playerNameInput = document.getElementById("playerNameInput");
const confirmNameBtn = document.getElementById("confirmNameBtn");

let selectedForSwap = null;
let selectedLabel = null;

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

const player = document.createElement("div");
player.className="player";

const num = document.createElement("div");
num.className="player-number";
num.textContent=isGK?"GK":number;
player.appendChild(num);

const position = document.createElement("div");
position.className="player-position";
position.textContent=pos||"";
player.appendChild(position);

const label = document.createElement("div");
label.className="player-label";
label.textContent="Hráč";
player.appendChild(label);

/* EDIT JMÉNA */
label.addEventListener("click", function(e){
e.stopPropagation();
selectedLabel = label;
playerNameInput.value = label.textContent;
editModal.style.display="flex";
});

/* STŘÍDÁNÍ */
player.addEventListener("click", function(e){
e.stopPropagation();

if(!selectedForSwap){
selectedForSwap = player;
player.style.outline="3px solid red";
return;
}

if(selectedForSwap===player){
player.style.outline="none";
selectedForSwap=null;
return;
}

swapPlayers(selectedForSwap,player);
selectedForSwap.style.outline="none";
selectedForSwap=null;
});

makeDraggable(player);
return player;
}

/* ===== SWAP ===== */
function swapPlayers(p1,p2){
["player-number","player-label","player-position"].forEach(cls=>{
const a=p1.querySelector("."+cls).textContent;
const b=p2.querySelector("."+cls).textContent;
p1.querySelector("."+cls).textContent=b;
p2.querySelector("."+cls).textContent=a;
});
}

/* ===== GENEROVÁNÍ ===== */
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
}else{
player=createPlayer(jersey,positions[rowIndex]?.[i]);
jersey++;
}

const y = 100 - ((rowIndex+1)*(100/(rows.length+1)));
const x = (i+1)*(100/(count+1));

player.style.left = x+"%";
player.style.top = y+"%";

pitch.appendChild(player);
}
});

/* LAVIČKA */
for(let i=jersey;i<=16;i++){
const b=document.createElement("div");
b.className="bench-player";
b.textContent=i;

b.addEventListener("click",function(){
if(!selectedForSwap)return;

const temp=selectedForSwap.querySelector(".player-number").textContent;
selectedForSwap.querySelector(".player-number").textContent=b.textContent;
b.textContent=temp;

selectedForSwap.style.outline="none";
selectedForSwap=null;
});

bench.appendChild(b);
}

});

/* ===== DRAG ===== */
function makeDraggable(el){
el.addEventListener("pointerdown",e=>{
el.setPointerCapture(e.pointerId);
});
el.addEventListener("pointermove",e=>{
if(e.buttons!==1)return;
const rect=pitch.getBoundingClientRect();
const x=((e.clientX-rect.left)/rect.width)*100;
const y=((e.clientY-rect.top)/rect.height)*100;
el.style.left=x+"%";
el.style.top=y+"%";
});
}

/* ===== POTVRZENÍ JMÉNA ===== */
const editNameBtn = document.getElementById("editNameBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

let selectedForEdit = null;

/* vyber hráče klikem */
pitch.addEventListener("click", function(e){
  const player = e.target.closest(".player");
  if (!player) return;

  selectedForEdit = player;

  document.querySelectorAll(".player").forEach(p=>{
    p.style.outline="none";
  });

  player.style.outline="3px solid yellow";
});

/* otevřít modal */
editNameBtn.addEventListener("click", function(){

  if (!selectedForEdit){
    alert("Nejprve vyber hráče kliknutím.");
    return;
  }

  const label = selectedForEdit.querySelector(".player-label");
  playerNameInput.value = label.textContent;

  editModal.style.display="flex";
});

/* potvrzení */
confirmNameBtn.addEventListener("click", function(){

  if (!selectedForEdit) return;

  const label = selectedForEdit.querySelector(".player-label");
  label.textContent = playerNameInput.value.trim() || "Hráč";

  editModal.style.display="none";
});

/* zavření */
closeModalBtn.addEventListener("click", function(){
  editModal.style.display="none";
});



/* ===== ULOŽENÍ ===== */
saveBtn.addEventListener("click",function(){

const data=[];
document.querySelectorAll(".player").forEach(p=>{
data.push({
number:p.querySelector(".player-number").textContent,
position:p.querySelector(".player-position").textContent,
name:p.querySelector(".player-label").textContent,
x:p.style.left,
y:p.style.top
});
});

localStorage.setItem("LINEUP_DATA",JSON.stringify(data));
alert("Sestava uložena ✔");
});

/* ===== EXPORT PNG ===== */
exportBtn.addEventListener("click",function(){
html2canvas(pitch).then(canvas=>{
const link=document.createElement("a");
link.download="lineup.png";
link.href=canvas.toDataURL();
link.click();
});
});

/* ===== EXPORT PDF ===== */
exportPdfBtn.addEventListener("click",async function(){
const {jsPDF}=window.jspdf;
const pdf=new jsPDF();
const canvas=await html2canvas(pitch);
pdf.addImage(canvas.toDataURL(),"PNG",10,10,180,250);
pdf.save("lineup.pdf");
});

});
