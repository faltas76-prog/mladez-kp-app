console.log("tactical.js – tools version loaded");

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
let mode = "draw";          // draw | erase | object
let activeTool = null;     // ball | goal | cone
let drawing = false;
let currentLine = null;

let lines = [];
let objects = [];
let selectedObject = null;

/* ===== OVLÁDÁNÍ ===== */
document.getElementById("drawBtn").onclick = () => {
  mode = "draw";
  activeTool = null;
};

document.getElementById("eraseBtn").onclick = () => {
  mode = "erase";
  activeTool = null;
};

document.getElementById("clearBtn").onclick = () => {
  lines = [];
  objects = [];
  redraw();
};

document.querySelectorAll("[data-tool]").forEach(btn => {
  btn.onclick = () => {
    mode = "object";
    activeTool = btn.dataset.tool;
  };
});

/* ===== POZICE ===== */
function pos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: e.clientX - r.left,
    y: e.clientY - r.top
  };
}

/* ===== HIT TEST ===== */
function hitObject(o, x, y) {
  return Math.hypot(o.x - x, o.y - y) < o.size;
}

/* ===== INTERAKCE ===== */
canvas.addEventListener("pointerdown", e => {
  drawing = true;
  const { x, y } = pos(e);

  selectedObject = objects.find(o => hitObject(o, x, y));

  if (mode === "erase") {
    if (selectedObject) {
      objects = objects.filter(o => o !== selectedObject);
      redraw();
    }
    return;
  }

  if (selectedObject) return;

  if (mode === "draw") {
    currentLine = [{ x, y }];
    lines.push(currentLine);
    return;
  }

  if (mode === "object" && activeTool) {
    objects.push({
      type: activeTool,
      x,
      y,
      size: activeTool === "ball" ? 8 : 20
    });
    redraw();
  }
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;
  const { x, y } = pos(e);

  if (selectedObject) {
    selectedObject.x = x;
    selectedObject.y = y;
    redraw();
    return;
  }

  if (mode === "draw" && currentLine) {
    currentLine.push({ x, y });
    redraw();
  }
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  currentLine = null;
  selectedObject = null;
});

/* ===== VYKRESLENÍ ===== */
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* čáry */
  ctx.strokeStyle = "#ffeb3b";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  lines.forEach(line => {
    ctx.beginPath();
    ctx.moveTo(line[0].x, line[0].y);
    line.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  });

  /* objekty */
  objects.forEach(o => drawObject(o));
}

/* ===== OBJEKTY ===== */
function drawObject(o) {
  if (o.type === "ball") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2);
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

  if (o.type === "goal") {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(o.x - 25, o.y - 10, 50, 20);
  }
}
