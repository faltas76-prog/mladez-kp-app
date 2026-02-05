console.log("tactical.js loaded");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* ===== RESIZE ===== */
function resizeCanvas() {
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width;
  canvas.height = r.height;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ===== STAV ===== */
let mode = "draw";
let drawing = false;
let currentLine = null;
let lines = [];

/* ===== TLAČÍTKA ===== */
document.getElementById("drawBtn").onclick = () => mode = "draw";
document.getElementById("eraseBtn").onclick = () => mode = "erase";
document.getElementById("clearBtn").onclick = () => {
  lines = [];
  redraw();
};

/* ===== POZICE ===== */
function pos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: e.clientX - r.left,
    y: e.clientY - r.top
  };
}

/* ===== INTERAKCE ===== */
canvas.addEventListener("pointerdown", e => {
  drawing = true;
  const {x,y} = pos(e);

  if (mode === "draw") {
    currentLine = [{x,y}];
    lines.push(currentLine);
  }
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;
  const {x,y} = pos(e);

  if (mode === "draw" && currentLine) {
    currentLine.push({x,y});
    redraw();
  }

  if (mode === "erase") {
    lines = lines.filter(line =>
      !line.some(p => Math.hypot(p.x-x, p.y-y) < 15)
    );
    redraw();
  }
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  currentLine = null;
});

/* ===== VYKRESLENÍ ===== */
function redraw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = "#ffeb3b";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  lines.forEach(line => {
    ctx.beginPath();
    ctx.moveTo(line[0].x, line[0].y);
    line.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  });
}
