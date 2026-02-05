console.log("players.js loaded");

/* ===== KLÍČE ===== */
const PLAYER_KEY = "players_v1";
const ATTENDANCE_KEY = "attendance_v1";

/* ===== DB ===== */
function loadPlayers() {
  return JSON.parse(localStorage.getItem(PLAYER_KEY)) || [];
}

function savePlayers(players) {
  localStorage.setItem(PLAYER_KEY, JSON.stringify(players));
}

function loadAttendance() {
  return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
}

function saveAttendance(data) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
}

/* ===== RENDER HRÁČŮ ===== */
function renderPlayers() {
  const list = document.getElementById("playerList");
  if (!list) return;

  list.innerHTML = "";
  const players = loadPlayers();

  players.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${p.name}
      <button data-id="${p.id}">❌</button>
    `;

    li.querySelector("button").onclick = () => {
      const updated = loadPlayers().filter(x => x.id !== p.id);
      savePlayers(updated);
      renderPlayers();
      renderAttendance();
    };

    list.appendChild(li);
  });
}

/* ===== DOCHÁZKA ===== */
function renderAttendance() {
  const box = document.getElementById("attendanceList");
  if (!box) return;

  box.innerHTML = "";
  const players = loadPlayers();

  players.forEach(p => {
    const row = document.createElement("div");
    row.innerHTML = `
      <strong>${p.name}</strong>
      <select data-id="${p.id}">
        <option value="ano">Ano</option>
        <option value="ne">Ne</option>
        <option value="omluven">Omluven</option>
        <option value="neomluven">Neomluven</option>
      </select>
    `;
    box.appendChild(row);
  });
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("playerName");
  const addBtn = document.getElementById("addPlayerBtn");
  const saveBtn = document.getElementById("saveAttendanceBtn");

  addBtn.onclick = () => {
    const name = input.value.trim();
    if (!name) return alert("Zadej jméno hráče");

    const players = loadPlayers();
    players.push({ id: Date.now().toString(), name });
    savePlayers(players);

    input.value = "";
    renderPlayers();
    renderAttendance();
  };

  saveBtn.onclick = () => {
    const date = new Date().toISOString().split("T")[0];
    const selects = document.querySelectorAll("#attendanceList select");

    const record = {
      date,
      data: Array.from(selects).map(s => ({
        playerId: s.dataset.id,
        status: s.value
      }))
    };

    const db = loadAttendance();
    db.push(record);
    saveAttendance(db);
    alert("Docházka uložena ✔");
  };

  renderPlayers();
  renderAttendance();
});
