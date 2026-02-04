const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");

let mode = "draw";
let drawing = false;
let lastX = 0, lastY = 0;
let pitchType = "full";

function setMode(m) {
  mode = m;
}

function setPitch(type) {
  pitchType = type;
  drawPitch();
}

function drawPitch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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

drawPitch();

canvas.addEventListener("pointerdown", e => {
  drawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;

  if (mode !== "draw" && mode !== "erase") {
    placeObject(lastX, lastY);
    drawing = false;
  }
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;

  if (mode === "draw") {
    ctx.strokeStyle = "#ffeb3b";
    ctx.lineWidth = 3;
  } else if (mode === "erase") {
    ctx.strokeStyle = "#2e7d32";
    ctx.lineWidth = 12;
  }

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("pointerup", () => drawing = false);

function placeObject(x, y) {
  if (mode === "blue") drawPlayer(x, y, "#2196f3");
  if (mode === "red") drawPlayer(x, y, "#e53935");

  if (mode === "ball") drawBall(x, y);
  if (mode === "balls") drawMultiBalls(x, y);

  if (mode === "cone") drawCone(x, y);
  if (mode === "hurdle") drawHurdle(x, y);
  if (mode === "goal") drawGoal(x, y);
}

function drawPlayer(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawBall(x, y) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawCone(x, y) {
  ctx.fillStyle = "#ff9800";
  ctx.beginPath();
  ctx.moveTo(x, y - 8);
  ctx.lineTo(x - 6, y + 8);
  ctx.lineTo(x + 6, y + 8);
  ctx.closePath();
  ctx.fill();
}

function drawMultiBalls(x, y) {
  drawBall(x - 6, y);
  drawBall(x + 6, y);
  drawBall(x, y - 6);
}

function drawHurdle(x, y) {
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x + 10, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x - 6, y - 10);
  ctx.moveTo(x + 6, y);
  ctx.lineTo(x + 6, y - 10);
  ctx.stroke();
}


function drawGoal(x, y) {
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(x - 12, y - 6, 24, 12);
}

function clearPad() {
  drawPitch();
}

function savePad() {
  const img = canvas.toDataURL("image/png");
  localStorage.setItem("tacticalPad", img);
  alert("Nákres uložen ✔");
}

function exportPDF() {
  const img = canvas.toDataURL("image/png");
  const w = window.open("");
  w.document.write(`
    <img src="${img}" style="width:100%">
    <script>window.print()<\/script>
  `);
}
