console.log("TACTICAL JS LOADED");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const wrap = document.getElementById("wrap");

/* resize */
function resize() {
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
}
window.addEventListener("resize", resize);
resize();

/* stav */
let mode = "draw";
let drawing = false;
let lines = [];
let balls = [];

/* tlačítka – TEST */
document.getElementById("drawBtn").onclick = () => {
  mode = "draw";
  alert("REŽIM: KRESLENÍ");
};

document.getElementById("eraseBtn").onclick = () => {
  mode = "erase";
  alert("REŽIM: MAZÁNÍ");
};

document.getElementById("ballBtn").onclick = () => {
  mode = "ball";
  alert("REŽIM: MÍČ");
};

/* pozice */
function pos(e){
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

/* kreslení */
canvas.addEventListener("pointerdown", e => {
  const p = pos(e);

  if(mode === "draw"){
    lines.push([p]);
    drawing = true;
  }

  if(mode === "ball"){
    balls.push(p);
    draw();
  }

  if(mode === "erase"){
    lines = [];
    balls = [];
    draw();
  }
});

canvas.addEventListener("pointermove", e => {
  if(!drawing || mode !== "draw") return;
  lines[lines.length-1].push(pos(e));
  draw();
});

canvas.addEventListener("pointerup", ()=> drawing=false);

/* render */
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="#ff0";
  ctx.lineWidth=3;
  lines.forEach(l=>{
    ctx.beginPath();
    ctx.moveTo(l[0].x,l[0].y);
    l.forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.stroke();
  });

  balls.forEach(b=>{
    ctx.fillStyle="#fff";
    ctx.beginPath();
    ctx.arc(b.x,b.y,10,0,Math.PI*2);
    ctx.fill();
  });
}
