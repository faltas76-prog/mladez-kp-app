const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");

let mode = "draw";
let pitchType = "full";
let drawing = false;
let selected = null;

const objects = [];
let currentSize = 10;

// ------------------ OVLÁDÁNÍ ------------------
function setMode(m) { mode = m; }
function setPitch(p) { pitchType = p; redraw(); }

document.getElementById("sizeControl")?.addEventListener("input", e => {
  currentSize = parseInt(e.target.value);
  if (selected) {
    selected.size = currentSize;
    redraw();
  }
});

// ------------------ HŘIŠTĚ ------------------
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

  if (pitchType === "half") {
    ctx.strokeRect(10, canvas.height / 2, canvas.width - 20, canvas.height / 2 - 10);
  }

  if (pitchType === "square") {
    ctx.strokeRect(60, 160, 240, 240);
  }

  if (pitchType === "rect") {
    ctx.strokeRect(40, 180, 280, 180);
  }
}

// ------------------ OBJEKTY ------------------
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

// ------------------ REDRAW ------------------
function redraw() {
  drawPitch();
  objects.forEach(drawObject);
}

// ------------------ INTERAKCE ------------------
canvas.addEventListener("pointerdown", e => {
  const x = e.offsetX;
  const y = e.offsetY;

  selected = objects.find(o => Math.hypot(o.x - x, o.y - y) < o.size);

  if (selected) {
    drawing = true;
    return;
  }

  if (mode !== "draw" && mode !== "erase") {
    const map = {
      blue: "playerBlue",
      red: "playerRed",
      ball: "ball",
      hurdle: "hurdle",
      cone: "cone",
      goal: "goal"
    };

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
  if (drawing && selected) {
    selected.x = e.offsetX;
    selected.y = e.offsetY;
    redraw();
  }
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  selected = null;
});

// ------------------ OVLÁDÁNÍ ------------------
function clearPad() {
  objects.length = 0;
  redraw();
}

function savePad() {
  localStorage.setItem("tacticalObjects", JSON.stringify(objects));
  alert("Nákres uložen ✔");
}

function loadPad() {
  const saved = JSON.parse(localStorage.getItem("tacticalObjects")) || [];
  objects.push(...saved);
  redraw();
}

function exportPDF() {
  const img = canvas.toDataURL("image/png");
  const w = window.open("");
  w.document.write(`<img src="${img}" style="width:100%"><script>window.print()<\/script>`);
}

alert("TACTICAL.JS NAČTEN");

// ------------------ START ------------------
drawPitch();
loadPad();
