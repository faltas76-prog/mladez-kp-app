const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const wrapper = document.getElementById("wrapper");

/* ===== RESIZE ===== */
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

/* ===== STAV ===== */
let mode = "draw";     // draw | erase | object
let tool = null;
let drawing = false;
let currentLine = null;

let lines = [];
let objects = [];

/* ===== TLAČÍTKA ===== */
document.getElementById("drawBtn").onclick = () => {
  mode = "draw";
  tool = null;
};

document.getElementById("eraseBtn").onclick = () => {
  mode = "erase";
  tool = null;
};

document.getElementById("clearBtn").onclick = () => {
  if (!confirm("Vymazat vše?")) return;
  lines = [];
  objects = [];
  redraw();
};

document.querySelectorAll("[data-tool]").forEach(btn => {
  btn.onclick = () => {
    mode = "object";
    tool = btn.dataset.tool;
  };
});

/* ===== POZICE ===== */
function pos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

/* ===== INTERAKCE ===== */
canvas.addEventListener("pointerdown", e => {
  const { x, y } = pos(e);
  drawing = true;

  if (mode === "draw") {
    currentLine = [{ x, y }];
    lines.push(currentLine);
  }

  if (mode === "object" && tool) {
    objects.push({ type: tool, x, y, size: 20 });
    redraw();
  }

  if (mode === "erase") {
    lines = lines.filter(l => !l.some(p => Math.hypot(p.x - x, p.y - y) < 10));
    objects = objects.filter(o => Math.hypot(o.x - x, o.y - y) > o.size);
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
});

/* ===== VYKRESLENÍ ===== */
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

  objects.forEach(o => {
    if (o.type === "ball") {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(o.x, o.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    if (o.type === "cone") {
      ctx.fillStyle = "#ff9800";
      ctx.beginPath();
      ctx.moveTo(o.x, o.y - 12);
      ctx.lineTo(o.x - 12, o.y + 12);
      ctx.lineTo(o.x + 12, o.y + 12);
      ctx.fill();
    }

    if (o.type === "goal") {
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(o.x - 20, o.y - 8, 40, 16);
    }
  });
}
