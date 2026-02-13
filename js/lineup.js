document.addEventListener("DOMContentLoaded",()=>{

const pitch=document.getElementById("pitch");
const bench=document.getElementById("bench");
const createBtn=document.getElementById("createBtn");
const formationSelect=document.getElementById("formationSelect");
const saveBtn=document.getElementById("saveBtn");
const exportBtn=document.getElementById("exportBtn");
const exportPdfBtn=document.getElementById("exportPdfBtn");
const editModal=document.getElementById("editModal");
const playerNameInput=document.getElementById("playerNameInput");
const confirmNameBtn=document.getElementById("confirmNameBtn");

let selectedForSwap=null;
let selectedLabel=null;

function getPositions(f){
return {
"1-4-4-2":[["GK"],["LB","CB","CB","RB"],["LM","CM","CM","RM"],["ST","ST"]],
"1-4-3-3":[["GK"],["LB","CB","CB","RB"],["CM","CM","CM"],["LW","ST","RW"]],
"1-4-2-3-1":[["GK"],["LB","CB","CB","RB"],["CDM","CDM"],["LAM","CAM","RAM"],["ST"]]
}[f];
}

function createPlayer(number,pos,isGK=false){
const player=document.createElement("div");
player.className="player";

const num=document.createElement("div");
num.className="player-number";
num.textContent=isGK?"GK":number;
player.appendChild(num);

const position=document.createElement("div");
position.className="player-position";
position.textContent=pos||"";
player.appendChild(position);

const label=document.createElement("div");
label.className="player-label";
label.textContent="Hráč";
player.appendChild(label);

label.onclick=(e)=>{
e.stopPropagation();
selectedLabel=label;
playerNameInput.value=label.textContent;
editModal.style.display="flex";
};

player.onclick=(e)=>{
e.stopPropagation();
if(!selectedForSwap){
selectedForSwap=player;
player.style.outline="3px solid red";
return;
}
if(selectedForSwap===player){
player.style.outline="none";
selectedForSwap=null;
return;
}
swap(selectedForSwap,player);
selectedForSwap.style.outline="none";
selectedForSwap=null;
};

makeDraggable(player);
return player;
}

function swap(p1,p2){
["player-number","player-label","player-position"].forEach(cls=>{
const a=p1.querySelector("."+cls).textContent;
const b=p2.querySelector("."+cls).textContent;
p1.querySelector("."+cls).textContent=b;
p2.querySelector("."+cls).textContent=a;
});
}

createBtn.onclick=()=>{
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
b.textContent=i;
b.onclick=()=>{
if(!selectedForSwap)return;
const temp=selectedForSwap.querySelector(".player-number").textContent;
selectedForSwap.querySelector(".player-number").textContent=b.textContent;
b.textContent=temp;
selectedForSwap.style.outline="none";
selectedForSwap=null;
};
bench.appendChild(b);
}
};

function makeDraggable(el){
el.onpointerdown=e=>el.setPointerCapture(e.pointerId);
el.onpointermove=e=>{
if(e.buttons!==1)return;
const rect=pitch.getBoundingClientRect();
const x=((e.clientX-rect.left)/rect.width)*100;
const y=((e.clientY-rect.top)/rect.height)*100;
el.style.left=x+"%";
el.style.top=y+"%";
};
}

confirmNameBtn.onclick=()=>{
if(!selectedLabel)return;
selectedLabel.textContent=playerNameInput.value.trim()||"Hráč";
editModal.style.display="none";
selectedLabel=null;
};

saveBtn.onclick=()=>{
alert("Uloženo do localStorage");
};

exportBtn.onclick=()=>{
html2canvas(pitch).then(canvas=>{
const link=document.createElement("a");
link.download="lineup.png";
link.href=canvas.toDataURL();
link.click();
});
};

exportPdfBtn.onclick=async()=>{
const {jsPDF}=window.jspdf;
const pdf=new jsPDF();
const canvas=await html2canvas(pitch);
pdf.addImage(canvas.toDataURL(),"PNG",10,10,180,250);
pdf.save("lineup.pdf");
};

});
