console.log("TACTICAL PAD FINAL LOADED");

const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");

/* ====== STAV ====== */
let mode = "draw";
let pitchType = "full";
let drawing = false;
let currentLine = null;

let objects = [];
let lines = [];

/* ====== UNDO / REDO ====== */
let history = [];
let future = [];

function saveState() {
  history.push(JSON.stringify({ objects, lines }));
  if (history.length > 50) history.shift();
  future = [];
}

function undo() {
  if (!history.length) return;
  future.push(JSON.stringify({ objects, lines }));
  const state = JSON.parse(history.pop());
  objects = state.objects;
  lines = state.lines;
  redraw();
}

function redo() {
  if (!future.length) return;
  history.push(JSON.stringify({ objects, lines }));
  const state = JSON.parse(future.pop());
  objects = state.objects;
  lines = state.lines;
  redraw();
}

/* ====== CANVAS SIZE ====== */
function resizeCanvas() {
  const w = window.innerWidth - 20;
  canvas.width = w;
  canvas.height = w * 1.4;
  redraw();
}
window.addEventListener("resize", resizeCanvas);

/* ====== POZICE ====== */
function pos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height)
  };
}

/* ====== UI ====== */
document.querySelectorAll("button[data-mode]").forEach(b =>
  b.onclick = () => mode = b.dataset.mode
);
pitchSelect.onchange = e => { pitchType = e.target.value; redraw(); };
undoBtn.onclick = undo;
redoBtn.onclick = redo;

/* ====== KRESBA HŘIŠTĚ ====== */
function drawPitch() {
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(20,20,canvas.width-40,canvas.height-40);
  if (pitchType === "full") {
    ctx.beginPath();
    ctx.moveTo(canvas.width/2,20);
    ctx.lineTo(canvas.width/2,canvas.height-20);
    ctx.stroke();
  }
}

/* ====== OBJEKTY ====== */
function drawObject(o) {
  if (o.type === "playerBlue" || o.type === "playerRed") {
    ctx.fillStyle = o.type === "playerBlue" ? "#2196f3" : "#e53935";
    ctx.beginPath();
    ctx.arc(o.x,o.y,14,0,Math.PI*2);
    ctx.fill();
  }
  if (o.type === "ball") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(o.x,o.y,7,0,Math.PI*2);
    ctx.fill();
  }
  if (o.type === "goal") {
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(o.x-20,o.y-10,40,20);
  }
}

/* ====== ČÁRY ====== */
function drawLines() {
  ctx.strokeStyle = "#ffeb3b";
  ctx.lineWidth = 3;
  lines.forEach(l=>{
    ctx.beginPath();
    ctx.moveTo(l[0].x,l[0].y);
    l.forEach(p=>ctx.lineTo(p.x,p.y));
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
canvas.onpointerdown = e => {
  drawing = true;
  saveState();
  const {x,y} = pos(e);

  if (mode === "draw") {
    currentLine = [{x,y}];
    lines.push(currentLine);
    return;
  }
  if (mode === "erase") return;

  objects.push({ type: mode, x, y });
  redraw();
};

canvas.onpointermove = e => {
  if (!drawing) return;
  const {x,y} = pos(e);

  if (mode === "erase") {
    objects = objects.filter(o => Math.hypot(o.x-x,o.y-y)>20);
    lines = lines.filter(l => !l.some(p => Math.hypot(p.x-x,p.y-y)<20));
    redraw();
    return;
  }

  if (currentLine) {
    currentLine.push({x,y});
    redraw();
  }
};

canvas.onpointerup = () => {
  drawing = false;
  currentLine = null;
};

/* ====== UKLÁDÁNÍ CVIČENÍ ====== */
saveBtn.onclick = () => {
  if (!exerciseName.value.trim()) return alert("Zadej název");
  const db = JSON.parse(localStorage.getItem("tacticalDB")||"[]");
  db.push({
    id: Date.now(),
    name: exerciseName.value,
    notes: exerciseNotes.value,
    pitchType,
    objects, lines
  });
  localStorage.setItem("tacticalDB",JSON.stringify(db));
  exerciseName.value="";
  exerciseNotes.value="";
  alert("Uloženo ✔");
};

resetBtn.onclick = () => {
  if (!confirm("Vymazat cvičení?")) return;
  objects=[]; lines=[];
  redraw();
};
/* ===============================
   HRÁČI + DOCHÁZKA (STABILNÍ VERZE)
   =============================== */

const PLAYER_KEY = "players_v1";
const ATTENDANCE_KEY = "attendance_v1";

/* ---------- DB ---------- */
function loadPlayers() {
  try {
    return JSON.parse(localStorage.getItem(PLAYER_KEY)) || [];
  } catch {
    return [];
  }
}

function savePlayers(players) {
  localStorage.setItem(PLAYER_KEY, JSON.stringify(players));
}

function loadAttendance() {
  try {
    return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAttendance(data) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
}

/* ---------- RENDER HRÁČŮ ---------- */
function renderPlayers() {
  const list = document.getElementById("playerList");
  if (!list) return;

  const players = loadPlayers();
  list.innerHTML = "";

  players.forEach(p => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.marginBottom = "4px";

    li.innerHTML = `
      <span>${p.name}</span>
      <button data-id="${p.id}">❌</button>
    `;

    li.querySelector("button").onclick = () => {
      if (!confirm(`Smazat hráče ${p.name}?`)) return;
      const updated = loadPlayers().filter(x => x.id !== p.id);
      savePlayers(updated);
      renderPlayers();
      renderAttendance();
    };

    list.appendChild(li);
  });
}

/* ---------- RENDER DOCHÁZKY ---------- */
function renderAttendance() {
  const container = document.getElementById("attendanceList");
  if (!container) return;

  const players = loadPlayers();
  container.innerHTML = "";

  players.forEach(p => {
    const row = document.createElement("div");
    row.style.marginBottom = "6px";

    row.innerHTML = `
      <strong>${p.name}</strong><br>
      <select data-id="${p.id}">
        <option value="ano">Ano</option>
        <option value="ne">Ne</option>
        <option value="omluven">Omluven</option>
        <option value="neomluven">Neomluven</option>
      </select>
    `;

    container.appendChild(row);
  });
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {

  const nameInput = document.getElementById("playerName");
  const addBtn = document.getElementById("addPlayerBtn");

  if (!nameInput || !addBtn) {
    console.error("❌ Chybí input #playerName nebo tlačítko #addPlayerBtn");
    return;
  }

  addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();

    if (!name) {
      alert("Zadej jméno hráče");
      return;
    }

    const players = loadPlayers();

    players.push({
      id: Date.now().toString(),
      name: name
    });

    savePlayers(players);

    // ✅ RESET INPUTU – tobě tohle chybělo
    nameInput.value = "";

    renderPlayers();
    renderAttendance();
  });

  renderPlayers();
  renderAttendance();
});


  saveAttendanceBtn.onclick = () => {
    const date = new Date().toISOString().split("T")[0];
    const selects = document.querySelectorAll("#attendanceList select");

    const record = {
      date,
      data: []
    };

    selects.forEach(sel => {
      record.data.push({
        playerId: sel.dataset.id,
        status: sel.value
      });
    });

    const db = loadAttendance();
    db.push(record);
    saveAttendance(db);

    alert("Docházka uložena ✔");
  };

  renderPlayers();
  renderAttendance();
});

/* ====== START ====== */
resizeCanvas();

