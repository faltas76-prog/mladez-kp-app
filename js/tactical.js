console.log("TACTICAL PAD – OBJECTS VERSION");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const wrap = document.getElementById("wrap");

/* =====================
   RESIZE
===================== */
function resize() {
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
  redraw();
}
window.addEventListener("resize", resize);
resize();

/* =====================
   STAV
===================== */
let mode = "draw";        // draw | erase | object
let activeTool = null;
let drawing = false;
let currentLine = null;

let lines = [];
let objects = [];

/* =====================
   UI – TLAČÍTKA
===================== */
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
  redraw();
};

document.querySelectorAll("[data-tool]").forEach(btn => {
  btn.onclick = () => {
    mode = "object";
    activeTool = btn.dataset.tool;
  };
});

/* =====================
   POZICE
===================== */
function pos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: e.clientX - r.left,
    y: e.clientY - r.top
  };
}

/* =====================
   INTERAKCE
===================== */
canvas.addEventListener("pointerdown", e => {
  const p = pos(e);
  drawing = true;

  // kreslení
  if (mode === "draw") {
    currentLine = [p];
    lines.push(currentLine);
  }

  // objekty
  if (mode === "object" && activeTool) {
    objects.push({
      type: activeTool,
      x: p.x,
      y: p.y,
      size: parseInt(document.getElementById("sizeSelect").value)
    });
    redraw();
  }

  // mazání
  if (mode === "erase") {
    lines = lines.filter(l =>
      !l.some(pt => Math.hypot(pt.x - p.x, pt.y - p.y) < 10)
    );
    objects = objects.filter(o =>
      Math.hypot(o.x - p.x, o.y - p.y) > o.size
    );
    redraw();
  }
});

canvas.addEventListener("pointermove", e => {
  if (!drawing || mode !== "draw") return;
  currentLine.push(pos(e));
  redraw();
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  currentLine = null;
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

  // ⚽ míč
  if (o.type === "ball") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🔺 kužel
  if (o.type === "cone") {
    ctx.fillStyle = "#ff9800";
    ctx.beginPath();
    ctx.moveTo(o.x, o.y - o.size);
    ctx.lineTo(o.x - o.size, o.y + o.size);
    ctx.lineTo(o.x + o.size, o.y + o.size);
    ctx.fill();
  }

  // 🟦 překážka
  if (o.type === "hurdle") {
    ctx.fillStyle = "#2196f3";
    ctx.fillRect(
      o.x - o.size,
      o.y - o.size / 4,
      o.size * 2,
      o.size / 2
    );
  }

  // 🥅 branka
  if (o.type === "goal") {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      o.x - o.size * 1.5,
      o.y - o.size / 2,
      o.size * 3,
      o.size
    );
  }
}
