const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");

let mode = "draw";
let pitchType = "full";
let drawing = false;
let currentLine = null;
let selected = null;

let size = 15;

const objects = [];
const lines = [];

/* ---------- OVLÁDÁNÍ ---------- */
function setMode(m) {
  mode = m;
  selected = null;
}

function setPitch(p) {
  pitchType = p;
  redraw();
}

const sizeCtrl = document.getElementById("sizeControl");
sizeCtrl.addEventListener("input", e => size = parseInt(e.target.value));

/* ---------- HŘIŠTĚ ---------- */
function drawPitch() {
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;

  const w = canvas.width;
  const h = canvas.height;
  const margin = 20;

  // Obrys hřiště
  ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

  // Středová čára
  ctx.beginPath();
  ctx.moveTo(w / 2, margin);
  ctx.lineTo(w / 2, h - margin);
  ctx.stroke();

  // Středový kruh
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Středový bod
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // Velké hřiště
  if (pitchType === "full") {

    // Vápna
    const boxW = 120;
    const boxH = 260;
    const smallBoxW = 60;
    const smallBoxH = 140;

    // Levé vápno
    ctx.strokeRect(margin, h / 2 - boxH / 2, boxW, boxH);
    ctx.strokeRect(margin, h / 2 - smallBoxH / 2, smallBoxW, smallBoxH);

    // Pravé vápno
    ctx.strokeRect(w - margin - boxW, h / 2 - boxH / 2, boxW, boxH);
    ctx.strokeRect(w - margin - smallBoxW, h / 2 - smallBoxH / 2, smallBoxW, smallBoxH);

    // Penaltové body
    ctx.beginPath();
    ctx.arc(margin + 90, h / 2, 3, 0, Math.PI * 2);
    ctx.arc(w - margin - 90, h / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Branky (náčrt)
    ctx.strokeRect(margin - 10, h / 2 - 40, 10, 80);
    ctx.strokeRect(w - margin, h / 2 - 40, 10, 80);

    // Rohy
    drawCorner(margin, margin);
    drawCorner(w - margin, margin, Math.PI / 2);
    drawCorner(margin, h - margin, -Math.PI / 2);
    drawCorner(w - margin, h - margin, Math.PI);
  }

  // Polovina hřiště
  if (pitchType === "half") {

    const boxW = 120;
    const boxH = 260;

    ctx.strokeRect(w - margin - boxW, h / 2 - boxH / 2, boxW, boxH);
    ctx.strokeRect(w - margin, h / 2 - 40, 10, 80);

    // Penalta
    ctx.beginPath();
    ctx.arc(w - margin - 90, h / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCorner(x, y, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI / 2);
  ctx.stroke();
  ctx.restore();
}

/* ---------- OBJEKTY ---------- */
function drawObject(o) {
  if (o.type === "playerBlue" || o.type === "playerRed") {
    ctx.fillStyle = o.type === "playerBlue" ? "#2196f3" : "#e53935";
    ctx.beginPath();
    ctx.arc(o.x,o.y,o.size,0,Math.PI*2);
    ctx.fill();
  }

  if (o.type === "ball") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(o.x,o.y,o.size/2,0,Math.PI*2);
    ctx.fill();
  }

  if (o.type === "cone") {
    ctx.fillStyle = "#ff9800";
    ctx.beginPath();
    ctx.moveTo(o.x,o.y-o.size);
    ctx.lineTo(o.x-o.size,o.y+o.size);
    ctx.lineTo(o.x+o.size,o.y+o.size);
    ctx.fill();
  }

  if (o.type === "hurdle") {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.x-o.size,o.y);
    ctx.lineTo(o.x+o.size,o.y);
    ctx.stroke();
  }

  if (o.type === "goal") {
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(o.x-o.size,o.y-o.size/2,o.size*2,o.size);
  }
}

/* ---------- KRESLENÍ ---------- */
function drawLines() {
  ctx.strokeStyle = "#ffeb3b";
  ctx.lineWidth = 3;
  lines.forEach(line => {
    ctx.beginPath();
    ctx.moveTo(line[0].x,line[0].y);
    line.forEach(p => ctx.lineTo(p.x,p.y));
    ctx.stroke();
  });
}

function redraw() {
  drawPitch();
  drawLines();
  objects.forEach(drawObject);
}

/* ---------- INTERAKCE ---------- */
canvas.addEventListener("pointerdown", e => {
  drawing = true;
  const x = e.offsetX;
  const y = e.offsetY;

  selected = objects.find(o => Math.hypot(o.x-x,o.y-y) < o.size);

  if (selected) return;

  if (mode === "draw") {
    currentLine = [{x,y}];
    lines.push(currentLine);
    return;
  }

  if (mode === "erase") return;

  objects.push({ id:Date.now(), type:mode, x, y, size });
  redraw();
});

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
function resetExercise() {
  if (!confirm("Opravdu chceš vymazat aktuální cvičení?")) return;

  objects.length = 0;
  lines.length = 0;

  document.getElementById("exerciseName").value = "";
  document.getElementById("exerciseNotes").value = "";

  redraw();
}

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;
  const x = e.offsetX;
  const y = e.offsetY;

  if (mode === "erase") {
    for (let i=objects.length-1;i>=0;i--) {
      if (Math.hypot(objects[i].x-x,objects[i].y-y)<size+10) {
        objects.splice(i,1);
      }
    }
    for (let i=lines.length-1;i>=0;i--) {
      for (let p of lines[i]) {
        if (Math.hypot(p.x-x,p.y-y)<size) {
          lines.splice(i,1);
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
    currentLine.push({x,y});
    redraw();
  }
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  currentLine = null;
  selected = null;
});

(function loadLastExercise() {
  const db = loadDB();
  if (!db.length) return;

  const last = db[db.length - 1];
  pitchType = last.pitchType;

  objects.push(...last.objects);
  lines.push(...last.lines);

  redraw();
})();
function resizeCanvas() {
  const ratio = 3 / 4; // poměr hřiště
  const width = Math.min(window.innerWidth - 16, 600);
  const height = width / ratio;

  canvas.width = width;
  canvas.height = height;

  redraw();
}

window.addEventListener("resize", resizeCanvas);

/* ---------- START ---------- */
resizeCanvas();

