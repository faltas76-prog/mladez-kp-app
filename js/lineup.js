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

if(!pitch || !createBtn) return;

let selectedForSwap = null;
let selectedPlayer = null;

/* ================== POZICE ================== */

function getPositions(f){
return {
"1-4-4-2":[["GK"],["LB","CB","CB","RB"],["LM","CM","CM","RM"],["ST","ST"]],
"1-4-3-3":[["GK"],["LB","CB","CB","RB"],["CM","CM","CM"],["LW","ST","RW"]],
"1-4-2-3-1":[["GK"],["LB","CB","CB","RB"],["CDM","CDM"],["LAM","CAM","RAM"],["ST"]]
}[f] || [];
}

/* ================== VYTVOŘ HRÁČE ================== */

function createPlayer(number,pos,isGK=false){

const player=document.createElement("div");
player.className="player";
player.style.position="absolute";

const num=document.createElement("div");
num.className="player-number";
num.textContent=isGK?"GK":number;
player.appendChild(num);

const positionLabel=document.createElement("div");
positionLabel.className="player-position";
positionLabel.textContent=pos||"";
player.appendChild(positionLabel);

const nameLabel=document.createElement("div");
nameLabel.className="player-label";
nameLabel.textContent="Hráč";
player.appendChild(nameLabel);

/* ===== STŘÍDÁNÍ ===== */
player.addEventListener("click",function(e){
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
const a=selectedForSwap.querySelector("."+cls).textContent;
const b=player.querySelector("."+cls).textContent;

selectedForSwap.querySelector("."+cls).textContent=b;
player.querySelector("."+cls).textContent=a;
});

selectedForSwap.style.outline="";
selectedForSwap=null;
});

/* ===== EDIT JMÉNA ===== */
nameLabel.addEventListener("contextmenu",function(e){
e.preventDefault();
selectedPlayer=player;
playerNameInput.value=nameLabel.textContent;
editModal.style.display="flex";
});

/* ===== DRAG ===== */
makeDraggable(player);

return player;
}

/* ================== GENEROVÁNÍ ================== */

createBtn.addEventListener("click",function(){

pitch.querySelectorAll(".player").forEach(p=>p.remove());
bench.innerHTML="";
selectedForSwap=null;

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

player.style.left=x+"%";
player.style.top=y+"%";

pitch.appendChild(player);
}
});

/* ===== LAVIČKA ===== */
for(let i=jersey;i<=16;i++){
const benchPlayer=document.createElement("div");
benchPlayer.className="bench-player";
benchPlayer.textContent=i;

benchPlayer.addEventListener("click",function(){

if(!selectedForSwap)return;

const fieldNum=selectedForSwap.querySelector(".player-number");
const temp=fieldNum.textContent;

fieldNum.textContent=benchPlayer.textContent;
benchPlayer.textContent=temp;

selectedForSwap.style.outline="";
selectedForSwap=null;
});

bench.appendChild(benchPlayer);
}

});

/* ================== DRAG FUNKCE ================== */

function makeDraggable(el){

let offsetX=0;
let offsetY=0;
let dragging=false;

el.addEventListener("pointerdown",function(e){

const rect=el.getBoundingClientRect();
offsetX=e.clientX-rect.left;
offsetY=e.clientY-rect.top;

dragging=true;
el.setPointerCapture(e.pointerId);
});

el.addEventListener("pointermove",function(e){

if(!dragging)return;

const pitchRect=pitch.getBoundingClientRect();

let x=e.clientX-pitchRect.left-offsetX+el.offsetWidth/2;
let y=e.clientY-pitchRect.top-offsetY+el.offsetHeight/2;

x=Math.max(0,Math.min(x,pitchRect.width));
y=Math.max(0,Math.min(y,pitchRect.height));

el.style.left=(x/pitchRect.width*100)+"%";
el.style.top=(y/pitchRect.height*100)+"%";
});

el.addEventListener("pointerup",function(){
dragging=false;
});
}

/* ================== ULOŽENÍ ================== */

if(saveBtn){
saveBtn.addEventListener("click",function(){

const data=[];

document.querySelectorAll(".player").forEach(p=>{
data.push({
number:p.querySelector(".player-number").textContent,
position:p.querySelector(".player-position").textContent,
name:p.querySelector(".player-label").textContent,
left:p.style.left,
top:p.style.top
});
});

localStorage.setItem("LINEUP_DATA",JSON.stringify(data));
alert("Sestava uložena ✔");
});
}

/* ================== EXPORT PNG ================== */

if(exportPngBtn){
exportPngBtn.addEventListener("click",function(){

if(typeof html2canvas==="undefined"){
alert("html2canvas není načten.");
return;
}

html2canvas(pitch,{backgroundColor:"#1b5e20"}).then(canvas=>{
const link=document.createElement("a");
link.download="lineup.png";
link.href=canvas.toDataURL("image/png");
link.click();
});
});
}

/* ================== EXPORT PDF ================== */

if(exportPdfBtn){
exportPdfBtn.addEventListener("click",async function(){

if(!window.jspdf){
alert("jsPDF není načten.");
return;
}

const { jsPDF } = window.jspdf;
const canvas=await html2canvas(pitch,{backgroundColor:"#1b5e20"});
const imgData=canvas.toDataURL("image/png");

const pdf=new jsPDF("portrait","mm","a4");
pdf.addImage(imgData,"PNG",10,10,190,270);
pdf.save("lineup.pdf");
});
}

/* ================== POTVRZENÍ JMÉNA ================== */

confirmNameBtn.addEventListener("click",function(){

if(!selectedPlayer)return;

selectedPlayer.querySelector(".player-label").textContent=
playerNameInput.value.trim()||"Hráč";

editModal.style.display="none";
selectedPlayer=null;
});

});
