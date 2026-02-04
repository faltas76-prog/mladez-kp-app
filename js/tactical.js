const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");

let drawing = false;
let mode = "draw";
let lastX = 0;
let lastY = 0;

// --- základní hřiště ---
function drawPitch() {
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;

  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  ctx.beginPath();
  ctx.moveTo(10, canvas.height / 2);
  ctx.lineTo(canvas.width - 10, canvas.height / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
  ctx.stroke();
}

drawPitch();

// --- režimy ---
function setMode(m) {
  mode = m;
}

canvas.addEventListener("pointerdown", e => {
  drawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;

  if (mode === "player") {
    drawPlayer(lastX, lastY);
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
    ctx.lineWidth = 10;
  }

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("pointerup", () => drawing = false);

function drawPlayer(x, y) {
  ctx.fillStyle = "#2196f3";
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
}

// --- ovládání ---
function clearPad() {
  drawPitch();
}

function savePad() {
  const img = canvas.toDataURL("image/png");
  localStorage.setItem("tacticalPad", img);
  alert("Nákres uložen ✔");
}

// --- načtení uloženého ---
const saved = localStorage.getItem("tacticalPad");
if (saved) {
  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0);
  img.src = saved;
}
