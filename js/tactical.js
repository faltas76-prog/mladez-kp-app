/* ===============================
   ZÁKLAD
=============================== */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const wrapper = document.getElementById("pitchWrapper");

const EXERCISE_KEY = "tactical_exercises_v1";

/* ===============================
   RESIZE – RESPONZIVNÍ HŘIŠTĚ
=============================== */
function resizeCanvas() {
  const rect = wrapper.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ===============================
   STAV
=============================== */
let mode = "draw";        // draw | erase | object
let activeTool = null;
let drawing = false;
let currentLine = null;

let lines = [];
let objects = [];

/* ===============================
   UI
=============================== */
const sizeSelect = document.getElementById("sizeSelect");

document.getElementById("drawBtn").onclick = () => {
  mode = "draw";
  activeTool = null;
};

document.getElementById("eraseBtn").onclick = () => {
  mode = "erase";
  activeTool = null;
};

document.getElementById("resetBtn").onclick = () => {
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

/* ===============================
   POZICE – PŘESNÁ
=============================== */
function pos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

/* ===============================
   INTERAKCE
=============================== */
canvas.addEventListener("pointerdown", e => {
  const { x, y } = pos(e);
  drawing = true;

  if (mode === "draw") {
    currentLine = [{ x, y }];
    lines.push(currentLine);
  }

  if (mode === "object" && activeTool) {
    objects.push({
      type: activeTool,
      x,
      y,
      size: parseInt(sizeSelect.value)
    });
    saveExercise();
    redraw();
  }

  if (mode === "erase") {
    lines = lines.filter(l => !l.some(p => Math.hypot(p.x - x, p.y - y) < 10));
    objects = objects.filter(o => Math.hypot(o.x - x, o.y - y) > o.size);
    saveExercise();
    redraw();
  }
});

canvas.addEventListener("pointermove", e => {
  if (!drawing || mode !== "draw") return;
  const { x, y } = pos(e);
  currentLine.push({ x, y });
  redraw();
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  currentLine = null;
  saveExercise();
});

/* ===============================
   VYKRESLENÍ
=============================== */
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

  objects.forEach(drawObject);
}

/* ===============================
   OBJEKTY
=============================== */
function drawObject(o) {
  if (o.type === "ball") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.size / 2, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.fillStyle = "#2196f3";
    ctx.fillRect(o.x - o.size, o.y - o.size / 4, o.size * 2, o.size / 2);
  }

  if (o.type === "goal") {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(o.x - o.size * 1.5, o.y - o.size / 2, o.size * 3, o.size);
  }
}

/* ===============================
   DATABÁZE (OFFLINE)
=============================== */
function saveExercise() {
  const data = {
    lines,
    objects,
    savedAt: Date.now()
  };
  localStorage.setItem(EXERCISE_KEY, JSON.stringify(data));
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

/* ===============================
   START
=============================== */
loadExercise();
redraw();
