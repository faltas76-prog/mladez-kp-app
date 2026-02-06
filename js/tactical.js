console.log("TACTICAL PAD RUNNING");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const wrap = document.getElementById("wrap");

/* ===== RESIZE – POVINNÉ ===== */
function resize() {
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
}
window.addEventListener("resize", resize);
resize();

/* ===== STAV ===== */
let mode = "draw";
let drawing = false;
let currentLine = null;
let lines = [];

/* ===== TLAČÍTKA ===== */
document.getElementById("drawBtn").onclick = () => {
  mode = "draw";
  console.log("MODE: DRAW");
};

document.getElementById("eraseBtn").onclick = () => {
  mode = "erase";
  console.log("MODE: ERASE");
};

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
  const p = pos(e);

  if (mode === "draw") {
    currentLine = [p];
    lines.push(currentLine);
    drawing = true;
  }

  if (mode === "erase") {
    lines = [];
    redraw();
  }
});

canvas.addEventListener("pointermove", e => {
  if (!drawing || mode !== "draw") return;
  currentLine.push(pos(e));
  redraw();
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  currentLine = null;
});

/* ===== RENDER ===== */
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#ffeb3b";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  lines.forEach(l => {
    ctx.beginPath();
    ctx.moveTo(l[0].x, l[0].y);
    l.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  });
}
