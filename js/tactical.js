console.log("tactical.js – tools + size loaded");

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
let activeTool = null;
let drawing = false;
let currentLine = null;

let lines = [];
let objects = [];
let selectedObject = null;

let toolSize = 16;

/* ===== UI ===== */
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

document.getElementById("sizeSlider").oninput = e => {
  toolSize = parseInt(e.target.value);
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
function hit(o, x, y) {
  return Math.hypot(o.x - x, o.y - y) < o.size + 5;
}

/* ===== INTERAKCE ===== */
canvas.addEventListener("pointerdown", e => {
  drawing = true;
  const { x, y } = pos(e);

  selectedObject = objects.find(o => hit(o, x, y));

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
      size: toolSize
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
  objects.forEach(drawObject);
}

/* ===== OBJEKTY ===== */
function drawObject(o) {
  switch (o.type) {
    case "ball":
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "goal":
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.strokeRect(o.x - o.size, o.y - o.size / 3, o.size * 2, o.size / 1.5);
      break;

    case "cone":
      ctx.fillStyle = "#ff9800";
      ctx.beginPath();
      ctx.moveTo(o.x, o.y - o.size);
      ctx.lineTo(o.x - o.size, o.y + o.size);
      ctx.lineTo(o.x + o.size, o.y + o.size);
      ctx.fill();
      break;

    case "hurdle":
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(o.x - o.size, o.y);
      ctx.lineTo(o.x + o.size, o.y);
      ctx.stroke();
      break;

    case "ladder":
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.strokeRect(
          o.x - o.size,
          o.y + i * (o.size / 2),
          o.size * 2,
          o.size / 3
        );
      }
      break;

    case "target":
      ctx.strokeStyle = "#f44336";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.size / 2, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
}
