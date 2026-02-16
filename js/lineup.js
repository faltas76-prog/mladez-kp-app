document.addEventListener("DOMContentLoaded", function(){

const pitch=document.getElementById("pitch");
const bench=document.getElementById("bench");
const formationSelect=document.getElementById("formationSelect");
const createBtn=document.getElementById("createBtn");
const exportPngBtn=document.getElementById("exportPngBtn");
const exportPdfBtn=document.getElementById("exportPdfBtn");
const editModal=document.getElementById("editModal");
const playerNameInput=document.getElementById("playerNameInput");
const confirmNameBtn=document.getElementById("confirmNameBtn");
const exportContainer=document.getElementById("lineupExport");

let selectedForSwap=null;
let selectedForEdit=null;

function getPositions(f){
return {
"1-4-4-2":[["GK"],["LB","CB","CB","RB"],["LM","CM","CM","RM"],["ST","ST"]],
"1-4-3-3":[["GK"],["LB","CB","CB","RB"],["CM","CM","CM"],["LW","ST","RW"]],
"1-4-2-3-1":[["GK"],["LB","CB","CB","RB"],["CDM","CDM"],["LAM","CAM","RAM"],["ST"]]
}[f]||[];
}

function makeDraggable(el){
let dragging=false,offsetX=0,offsetY=0;

el.addEventListener("pointerdown",e=>{
const rect=el.getBoundingClientRect();
offsetX=e.clientX-rect.left;
offsetY=e.clientY-rect.top;
dragging=true;
el.setPointerCapture(e.pointerId);
});

el.addEventListener("pointermove",e=>{
if(!dragging) return;
const pitchRect=pitch.getBoundingClientRect();
let x=e.clientX-pitchRect.left-offsetX+el.offsetWidth/2;
let y=e.clientY-pitchRect.top-offsetY+el.offsetHeight/2;
x=Math.max(0,Math.min(x,pitchRect.width));
y=Math.max(0,Math.min(y,pitchRect.height));
el.style.left=(x/pitchRect.width*100)+"%";
el.style.top=(y/pitchRect.height*100)+"%";
});

el.addEventListener("pointerup",()=>dragging=false);
}

function createPlayer(number,pos,isGK=false){

const player=document.createElement("div");
player.className="player";

const num=document.createElement("div");
num.className="player-number";
num.textContent=isGK?"GK":number;
player.appendChild(num);

const name=document.createElement("div");
name.className="player-label";
name.textContent="Hráč";
player.appendChild(name);

player.addEventListener("click",e=>{
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
const a=selectedForSwap.querySelector(".player-number").textContent;
const b=player.querySelector(".player-number").textContent;
selectedForSwap.querySelector(".player-number").textContent=b;
player.querySelector(".player-number").textContent=a;
selectedForSwap.style.outline="";
selectedForSwap=null;
});

name.addEventListener("pointerdown",e=>{
e.stopPropagation();
selectedForEdit=player;
playerNameInput.value=name.textContent;
editModal.style.display="flex";
});

makeDraggable(player);
return player;
}

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
if(rowIndex===0&&count===1){
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

for(let i=jersey;i<=16;i++){
const b=document.createElement("div");
b.className="bench-player";
b.innerHTML=`<div>${i}</div><div class="bench-name">Hráč</div>`;
b.querySelector(".bench-name").addEventListener("pointerdown",e=>{
e.stopPropagation();
selectedForEdit=b;
playerNameInput.value=b.querySelector(".bench-name").textContent;
editModal.style.display="flex";
});
bench.appendChild(b);
}

});

confirmNameBtn.addEventListener("click",function(){
if(!selectedForEdit) return;
if(selectedForEdit.classList.contains("player")){
selectedForEdit.querySelector(".player-label").textContent=
playerNameInput.value.trim()||"Hráč";
}
if(selectedForEdit.classList.contains("bench-player")){
selectedForEdit.querySelector(".bench-name").textContent=
playerNameInput.value.trim()||"Hráč";
}
editModal.style.display="none";
playerNameInput.value="";
selectedForEdit=null;
});

exportPngBtn.addEventListener("click",async()=>{
const canvas=await html2canvas(exportContainer,{backgroundColor:"#1b5e20",scale:2});
const link=document.createElement("a");
link.download="lineup.png";
link.href=canvas.toDataURL();
link.click();
});

exportPdfBtn.addEventListener("click",async()=>{
const { jsPDF }=window.jspdf;
const canvas=await html2canvas(exportContainer,{backgroundColor:"#1b5e20",scale:2});
const imgData=canvas.toDataURL("image/png");
const pdf=new jsPDF("portrait","mm","a4");
pdf.addImage(imgData,"PNG",10,10,190,260);
pdf.save("lineup.pdf");
});

});
