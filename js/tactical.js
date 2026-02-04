const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");

let mode = "draw";
let pitchType = "full";
let drawing = false;
let currentLine = null;
let selected = null;
let currentSize = 10;

const objects = [];
const lines = [];

/* ================= OVLÁDÁNÍ ================= */
function setMode(m) {
  mode = m;
  selected = null;
}

document.getElementById("sizeControl")?.addEventListener("input", e => {
  currentSize = parseInt(e.target.value);
  if (selected) {
    selected.size = currentSize;
    redraw();
  }
});

/* ================= HŘIŠTĚ ================= */
function drawPitch() {
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;

  if (pitchType === "full") {
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.beginPath();
    ctx.moveTo(10, canvas.height / 2);
    ctx.lineTo(canvas.width - 10, canvas.height / 2);
    ctx.stroke();
  }
}

/* ================= OBJEKTY ================= */
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

  if (o.type === "hurdle") {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.x - o.size, o.y);
    ctx.lineTo(o.x + o.size, o.y);
    ctx.stroke();
  }

  if (o.type === "cone") {
    ctx.fillStyle = "#ff9800";
    ctx.beginPath();
    ctx.moveTo(o.x, o.y - o.size);
    ctx.lineTo(o.x - o.size, o.y + o.size);
    ctx.lineTo(o.x + o.size, o.y + o.size);
    ctx.fill();
  }

  if (o.type === "goal") {
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(o.x - o.size, o.y - o.size / 2, o.size * 2, o.size);
  }
}

/* ================= ČÁRY ================= */
function drawLines() {
  ctx.strokeStyle = "#ffeb3b";
  ctx.lineWidth = 3;

  lines.forEach(line => {
    ctx.beginPath();
    ctx.moveTo(line[0].x, line[0].y);
    for (let p of line) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
}

/* ================= REDRAW ================= */
function redraw() {
  drawPitch();
  drawLines();
  objects.forEach(drawObject);
}

/* ================= INTERAKCE ================= */
canvas.addEventListener("pointerdown", e => {
  const x = e.offsetX;
  const y = e.offsetY;

  // výběr objektu
  selected = objects.find(o => Math.hypot(o.x - x, o.y - y) < o.size);

  if (selected) {
    drawing = true;
    return;
  }

  // kreslení čáry
  if (mode === "draw") {
    currentLine = [{ x, y }];
    lines.push(currentLine);
    drawing = true;
    return;
  }

  // mazání
  if (mode === "erase") {
    const idx = objects.findIndex(o => Math.hypot(o.x - x, o.y - y) < o.size);
    if (idx > -1) objects.splice(idx, 1);
    redraw();
    return;
  }

  // přidání objektu
  const map = {
    blue: "playerBlue",
    red: "playerRed",
    ball: "ball",
    hurdle: "hurdle",
    cone: "cone",
    goal: "goal"
  };

  if (map[mode]) {
    objects.push({
      id: Date.now(),
      type: map[mode],
      x, y,
      size: currentSize
    });
    redraw();
  }
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;

  if (selected) {
    selected.x = e.offsetX;
    selected.y = e.offsetY;
    redraw();
    return;
  }

  if (currentLine) {
    currentLine.push({ x: e.offsetX, y: e.offsetY });
    redraw();
  }
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  currentLine = null;
  selected = null;
});

/* ================= OVLÁDÁNÍ ================= */
function clearPad() {
  objects.length = 0;
  lines.length = 0;
  redraw();
}

function savePad() {
  localStorage.setItem("tacticalObjects", JSON.stringify({ objects, lines }));
  alert("Nákres uložen ✔");
}

function loadPad() {
  const saved = JSON.parse(localStorage.getItem("tacticalObjects"));
  if (!saved) return;
  objects.push(...saved.objects);
  lines.push(...saved.lines);
  redraw();
}

function exportPDF() {
  const img = canvas.toDataURL("image/png");
  const w = window.open("");
  w.document.write(`<img src="${img}" style="width:100%"><script>window.print()<\/script>`);
}

/* ================= START ================= */
drawPitch();
loadPad();
