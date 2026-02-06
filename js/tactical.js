console.log("tactical.js – FINAL STABLE");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* =========================
   RESIZE + HŘIŠTĚ
========================= */
let pitchType = "full";

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  redraw();
}
window.addEventListener("resize", resizeCanvas);

/* =========================
   STAV
========================= */
let mode = "draw";
let activeTool = null;
let drawing = false;
let currentLine = null;
let toolSize = 16;

let lines = [];
let objects = [];

/* ===== UNDO / REDO ===== */
let history = [];
let future = [];

function saveState() {
  history.push(JSON.stringify({ lines, objects }));
  if (history.length > 50) history.shift();
  future = [];
}

function undo() {
  if (!history.length) return;
  future.push(JSON.stringify({ lines, objects }));
  const state = JSON.parse(history.pop());
  lines = state.lines;
  objects = state.objects;
  redraw();
}

function redo() {
  if (!future.length) return;
  history.push(JSON.stringify({ lines, objects }));
  const state = JSON.parse(future.pop());
  lines = state.lines;
  objects = state.objects;
  redraw();
}

/* =========================
   UI
========================= */
drawBtn.onclick = () => { mode = "draw"; activeTool = null; };
eraseBtn.onclick = () => { mode = "erase"; activeTool = null; };
undoBtn.onclick = undo;
redoBtn.onclick = redo;

clearBtn.onclick = () => {
  if (!confirm("Vymazat celé cvičení?")) return;
  saveState();
  lines = [];
  objects = [];
  redraw();
};

sizeSlider.oninput = e => toolSize = parseInt(e.target.value);

pitchSelect.onchange = e => {
  pitchType = e.target.value;
  resizeCanvas();
};

document.querySelectorAll("[data-tool]").forEach(btn => {
  btn.onclick = () => {
    mode = "object";
    activeTool = btn.dataset.tool;
  };
});

/* =========================
   POZICE
========================= */
function pos(e) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}


/* =========================
   INTERAKCE
========================= */
canvas.addEventListener("pointerdown", e => {
  drawing = true;
  const { x, y } = pos(e);

  const hit = objects.find(o => Math.hypot(o.x - x, o.y - y) < o.size);

  if (mode === "erase") {
    if (hit) {
      saveState();
      objects = objects.filter(o => o !== hit);
      redraw();
    }
    return;
  }

  if (hit) {
    saveState();
    hit.drag = true;
    return;
  }

  if (mode === "draw") {
    saveState();
    currentLine = [{ x, y }];
    lines.push(currentLine);
  }

  if (mode === "object" && activeTool) {
    saveState();
    objects.push({ type: activeTool, x, y, size: toolSize });
    redraw();
  }
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;
  const { x, y } = pos(e);

  const dragging = objects.find(o => o.drag);
  if (dragging) {
    dragging.x = x;
    dragging.y = y;
    redraw();
    return;
  }

  if (mode === "draw" && currentLine) {
    currentLine.push({ x, y });
    redraw();
  }

  if (mode === "erase") {
    const before = objects.length + lines.length;
    objects = objects.filter(o => Math.hypot(o.x - x, o.y - y) > o.size);
    lines = lines.filter(l => !l.some(p => Math.hypot(p.x - x, p.y - y) < 12));
    if (before !== objects.length + lines.length) redraw();
  }
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  currentLine = null;
  objects.forEach(o => delete o.drag);
});

/* =========================
   VYKRESLENÍ
========================= */
function drawPitch() {
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  if (pitchType === "full") {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.stroke();
  }
}

function redraw() {
  drawPitch();

  ctx.strokeStyle = "#ffeb3b";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  lines.forEach(l => {
    ctx.beginPath();
    ctx.moveTo(l[0].x, l[0].y);
    l.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  });

  objects.forEach(drawObject);
}

/* =========================
   OBJEKTY
========================= */
function drawObject(o) {
  if (o.type === "ball") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (o.type === "goal") {
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(o.x - o.size, o.y - o.size / 3, o.size * 2, o.size / 1.5);
  }

  if (o.type === "cone") {
    ctx.fillStyle = "#ff9800";
    ctx.beginPath();
    ctx.moveTo(o.x, o.y - o.size);
    ctx.lineTo(o.x - o.size, o.y + o.size);
    ctx.lineTo(o.x + o.size, o.y + o.size);
    ctx.fill();
  }

  if (o.type === "hurdle") {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.x - o.size, o.y);
    ctx.lineTo(o.x + o.size, o.y);
    ctx.stroke();
  }
}

/* =========================
   ULOŽENÍ CVIČENÍ
========================= */
saveExerciseBtn.onclick = () => {
  const data = {
    pitchType,
    lines,
    objects,
    savedAt: new Date().toISOString()
  };

  localStorage.setItem("tactical_exercise", JSON.stringify(data));
  alert("Cvičení uloženo ✔");
};

/* =========================
   START
========================= */
resizeCanvas();
