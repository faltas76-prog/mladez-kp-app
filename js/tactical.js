console.log("tactical.js FIXED loaded");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* =====================
   RESIZE
===================== */
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  redraw();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* =====================
   STAV
===================== */
let mode = "draw";        // draw | erase | object
let activeTool = null;   // ball | goal | cone | ...
let drawing = false;
let currentLine = null;

let lines = [];
let objects = [];

/* =====================
   UI – TLAČÍTKA
===================== */
const drawBtn = document.getElementById("drawBtn");
const eraseBtn = document.getElementById("eraseBtn");
const clearBtn = document.getElementById("clearBtn");

drawBtn.onclick = () => {
  mode = "draw";
  activeTool = null;
};

eraseBtn.onclick = () => {
  mode = "erase";
  activeTool = null;
};

clearBtn.onclick = () => {
  if (!confirm("Vymazat celé cvičení?")) return;
  lines = [];
  objects = [];
  saveExercise();
  redraw();
};

document.querySelectorAll("[data-tool]").forEach(btn => {
  btn.onclick = () => {
    mode = "object";
    activeTool = btn.dataset.tool;
  };
});

/* =====================
   POZICE – OPRAVENÁ
===================== */
function pos(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].pageX : e.pageX) - rect.left - window.scrollX;
  const y = (e.touches ? e.touches[0].pageY : e.pageY) - rect.top - window.scrollY;
  return { x, y };
}

/* =====================
   INTERAKCE
===================== */
canvas.addEventListener("pointerdown", e => {
  drawing = true;
  const { x, y } = pos(e);

  // mazání objektu
  if (mode === "erase") {
    objects = objects.filter(o => Math.hypot(o.x - x, o.y - y) > o.size);
    lines = lines.filter(l => !l.some(p => Math.hypot(p.x - x, p.y - y) < 10));
    saveExercise();
    redraw();
    return;
  }

  // kreslení
  if (mode === "draw") {
    currentLine = [{ x, y }];
    lines.push(currentLine);
    redraw();
    return;
  }

  // přidání objektu
  if (mode === "object" && activeTool) {
    objects.push({
      type: activeTool,
      x,
      y,
      size: 20
    });
    saveExercise();
    redraw();
  }
});

canvas.addEventListener("pointermove", e => {
  if (!drawing || mode !== "draw" || !currentLine) return;
  const { x, y } = pos(e);
  currentLine.push({ x, y });
  redraw();
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  currentLine = null;
  saveExercise();
});

/* =====================
   VYKRESLENÍ
===================== */
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // čáry
  ctx.strokeStyle = "#ffeb3b";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  lines.forEach(l => {
    ctx.beginPath();
    ctx.moveTo(l[0].x, l[0].y);
    l.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  });

  // objekty
  objects.forEach(drawObject);
}

/* =====================
   OBJEKTY
===================== */
function drawObject(o) {
  if (o.type === "ball") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (o.type === "goal") {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(o.x - 30, o.y - 10, 60, 20);
  }

  if (o.type === "cone") {
    ctx.fillStyle = "#ff9800";
    ctx.beginPath();
    ctx.moveTo(o.x, o.y - o.size);
    ctx.lineTo(o.x - o.size, o.y + o.size);
    ctx.lineTo(o.x + o.size, o.y + o.size);
    ctx.fill();
  }
}

/* =====================
   ULOŽENÍ / NAČTENÍ
===================== */
const EXERCISE_KEY = "tactical_exercise_v1";

function saveExercise() {
  localStorage.setItem(
    EXERCISE_KEY,
    JSON.stringify({ lines, objects })
  );
}

function loadExercise() {
  const raw = localStorage.getItem(EXERCISE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    lines = data.lines || [];
    objects = data.objects || [];
  } catch {}
}

/* =====================
   START
===================== */
loadExercise();
redraw();
