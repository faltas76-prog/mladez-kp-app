console.log("TACTICAL PAD LOADED");

const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");

/* ====== STAV ====== */
let mode = "draw";
let pitchType = "full";
let drawing = false;
let selected = null;
let currentLine = null;
let size = 14;

const objects = [];
const lines = [];

/* ====== RESIZE ====== */
function resizeCanvas() {
  const isWide = window.innerWidth > 900;

  if (isWide) {
    canvas.width = Math.min(window.innerWidth - 20, 1000);
    canvas.height = canvas.width * 0.6;
  } else {
    canvas.width = window.innerWidth - 16;
    canvas.height = canvas.width * 1.4;
  }

  redraw();
}
window.addEventListener("resize", resizeCanvas);

/* ====== OVLÁDÁNÍ UI ====== */
document.querySelectorAll("button[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    mode = btn.dataset.mode;
    selected = null;
  });
});

document.getElementById("pitchSelect").addEventListener("change", e => {
  pitchType = e.target.value;
  redraw();
});

document.getElementById("sizeControl").addEventListener("input", e => {
  size = parseInt(e.target.value);
});

/* ====== HŘIŠTĚ ====== */
function drawPitch() {
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;

  const m = 20;
  const w = canvas.width;
  const h = canvas.height;

  ctx.strokeRect(m, m, w - m * 2, h - m * 2);

  if (pitchType === "full") {
    ctx.beginPath();
    ctx.moveTo(w / 2, m);
    ctx.lineTo(w / 2, h - m);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/* ====== OBJEKTY ====== */
function drawObject(o) {
  if (o.type === "playerBlue" || o.type === "playerRed") {
    ctx.fillStyle = o.type === "playerBlue" ? "#2196f3" : "#e53935";
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2);
    ctx.fill();
  }

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
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.x - o.size, o.y);
    ctx.lineTo(o.x + o.size, o.y);
    ctx.stroke();
  }

  if (o.type === "goal") {
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(
      o.x - o.size * 1.5,
      o.y - o.size / 2,
      o.size * 3,
      o.size
    );
  }
}
const DB_KEY = "tacticalExercises";
function loadDB() {
  return JSON.parse(localStorage.getItem(DB_KEY)) || [];
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}
function saveExercise() {
  const nameInput = document.getElementById("exerciseName");
  const notesInput = document.getElementById("exerciseNotes");

  if (!nameInput.value.trim()) {
    alert("Zadej název cvičení");
    return;
  }

  const db = loadDB();

  db.push({
    id: Date.now(),
    name: nameInput.value,
    notes: notesInput.value,
    pitchType,
    objects: JSON.parse(JSON.stringify(objects)),
    lines: JSON.parse(JSON.stringify(lines)),
    createdAt: new Date().toISOString()
  });

  saveDB(db);
  alert("Cvičení uloženo ✔");
}

/* ====== ČÁRY ====== */
function drawLines() {
  ctx.strokeStyle = "#ffeb3b";
  ctx.lineWidth = 3;

  lines.forEach(line => {
    ctx.beginPath();
    ctx.moveTo(line[0].x, line[0].y);
    line.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  });
}

/* ====== REDRAW ====== */
function redraw() {
  drawPitch();
  drawLines();
  objects.forEach(drawObject);
}

/* ====== INTERAKCE ====== */
canvas.addEventListener("pointerdown", e => {
  drawing = true;
  const x = e.offsetX;
  const y = e.offsetY;

  selected = objects.find(o => Math.hypot(o.x - x, o.y - y) < o.size);

  if (selected) return;

  if (mode === "draw") {
    currentLine = [{ x, y }];
    lines.push(currentLine);
    return;
  }

  if (mode === "erase") return;

  objects.push({ id: Date.now(), type: mode, x, y, size });
  redraw();
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  if (mode === "erase") {
    for (let i = objects.length - 1; i >= 0; i--) {
      if (Math.hypot(objects[i].x - x, objects[i].y - y) < size + 10) {
        objects.splice(i, 1);
      }
    }

    for (let i = lines.length - 1; i >= 0; i--) {
      for (let p of lines[i]) {
        if (Math.hypot(p.x - x, p.y - y) < size) {
          lines.splice(i, 1);
          break;
        }
      }
    }

    redraw();
    return;
  }

  if (selected) {
    selected.x = x;
    selected.y = y;
    redraw();
    return;
  }

  if (currentLine) {
    currentLine.push({ x, y });
    redraw();
  }
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  selected = null;
  currentLine = null;
});
function resetExercise() {
  if (!confirm("Opravdu chceš vymazat aktuální cvičení?")) return;

  objects.length = 0;
  lines.length = 0;

  document.getElementById("exerciseName").value = "";
  document.getElementById("exerciseNotes").value = "";

  document.getElementById("saveExerciseBtn")
  .addEventListener("click", saveExercise);

document.getElementById("resetExerciseBtn")
  .addEventListener("click", resetExercise);
  redraw();
}

/* ====== START ====== */
resizeCanvas();

(function loadLastExercise() {
  const db = loadDB();
  if (!db.length) return;

  const last = db[db.length - 1];

  pitchType = last.pitchType;
  objects.push(...last.objects);
  lines.push(...last.lines);

  document.getElementById("exerciseName").value = last.name;
  document.getElementById("exerciseNotes").value = last.notes;

  redraw();
})();
