console.log("players.js loaded");

/* =========================
   KONSTANTY – LOCAL STORAGE
========================= */
const PLAYER_KEY = "players_v2";
const RECORD_KEY = "attendance_records_v1";

/* =========================
   DB FUNKCE
========================= */
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

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(RECORD_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(RECORD_KEY, JSON.stringify(records));
}

/* =========================
   RENDER HRÁČŮ + FORMULÁŘ
========================= */
function renderPlayers() {
  const box = document.getElementById("playerList");
  if (!box) return;

  const players = loadPlayers();
  box.innerHTML = "";

  players.forEach(p => {
    const div = document.createElement("div");
    div.className = "player";

    div.innerHTML = `
      <strong>${p.name}</strong>
      <button data-id="${p.id}">❌</button>
      <br><br>

      Docházka:
      <select class="attendance" data-id="${p.id}">
        <option value="ano">Ano</option>
        <option value="ne">Ne</option>
        <option value="omluven">Omluven</option>
        <option value="neomluven">Neomluven</option>
      </select>

      Hodnocení:
      <select class="rating" data-id="${p.id}">
        <option value="1">1 ⭐</option>
        <option value="2">2 ⭐⭐</option>
        <option value="3">3 ⭐⭐⭐</option>
        <option value="4">4 ⭐⭐⭐⭐</option>
        <option value="5">5 ⭐⭐⭐⭐⭐</option>
      </select>
    `;

    /* mazání hráče */
    div.querySelector("button").onclick = () => {
      if (!confirm(`Smazat hráče ${p.name}?`)) return;

      const updated = loadPlayers().filter(x => x.id !== p.id);
      savePlayers(updated);
      renderPlayers();
      renderAttendanceHistory();
    };

    box.appendChild(div);
  });
}

/* =========================
   ULOŽENÍ DOCHÁZKY
========================= */
function saveAttendance() {
  const players = loadPlayers();
  if (!players.length) {
    alert("Nejsou žádní hráči");
    return;
  }

  const record = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    players: players.map(p => ({
      playerId: p.id,
      name: p.name,
      attendance:
        document.querySelector(`.attendance[data-id="${p.id}"]`)?.value ||
        "ne",
      rating:
        document.querySelector(`.rating[data-id="${p.id}"]`)?.value || "3"
    }))
  };

  const records = loadRecords();
  records.push(record);
  saveRecords(records);

  renderAttendanceHistory();
  alert("Docházka uložena ✔");
}

/* =========================
   HISTORIE DOCHÁZKY
========================= */
function renderAttendanceHistory() {
  const box = document.getElementById("attendanceHistory");
  if (!box) return;

  const records = loadRecords();
  box.innerHTML = "";

  records
    .slice()
    .reverse()
    .forEach(r => {
      const div = document.createElement("div");
      div.className = "player";

      div.innerHTML = `
        <strong>📅 ${new Date(r.date).toLocaleString()}</strong>
        <ul>
          ${r.players
            .map(
              p =>
                `<li>${p.name} – ${p.attendance} – ⭐ ${p.rating}</li>`
            )
            .join("")}
        </ul>
      `;

      box.appendChild(div);
    });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("playerName");
  const addBtn = document.getElementById("addPlayerBtn");
  const saveBtn = document.getElementById("saveAttendanceBtn");

  /* přidání hráče */
  addBtn.onclick = () => {
    const name = input.value.trim();
    if (!name) {
      alert("Zadej jméno hráče");
      return;
    }

    const players = loadPlayers();
    players.push({
      id: Date.now().toString(),
      name
    });

    savePlayers(players);
    input.value = "";

    renderPlayers();
  };

  /* uložení docházky */
  saveBtn.onclick = saveAttendance;

  renderPlayers();
  renderAttendanceHistory();
});
