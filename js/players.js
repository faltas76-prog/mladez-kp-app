console.log("players.js loaded");

/* ===== KLÍČE ===== */
const PLAYER_KEY = "players_v2";
const RECORD_KEY = "records_v1";

/* ===== DB ===== */
function loadPlayers() {
  return JSON.parse(localStorage.getItem(PLAYER_KEY)) || [];
}
function savePlayers(p) {
  localStorage.setItem(PLAYER_KEY, JSON.stringify(p));
}
function loadRecords() {
  return JSON.parse(localStorage.getItem(RECORD_KEY)) || [];
}
function saveRecords(r) {
  localStorage.setItem(RECORD_KEY, JSON.stringify(r));
}

/* ===== RENDER ===== */
function renderPlayers() {
  const box = document.getElementById("playerList");
  const players = loadPlayers();
  box.innerHTML = "";

  players.forEach(p => {
    const div = document.createElement("div");
    div.className = "player";

    div.innerHTML = `
      <strong>${p.name}</strong>
      <button data-id="${p.id}">❌</button><br>

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

    div.querySelector("button").onclick = () => {
      const updated = loadPlayers().filter(x => x.id !== p.id);
      savePlayers(updated);
      renderPlayers();
    };

    box.appendChild(div);
  });
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("playerName");
  const addBtn = document.getElementById("addPlayerBtn");
  const saveBtn = document.getElementById("saveAttendanceBtn");

  addBtn.onclick = () => {
    const name = input.value.trim();
    if (!name) return alert("Zadej jméno");

    const players = loadPlayers();
    players.push({ id: Date.now().toString(), name });
    savePlayers(players);

    input.value = "";
    renderPlayers();
  };

  saveBtn.onclick = () => {
    const date = new Date().toISOString().split("T")[0];
    const players = loadPlayers();

    const record = {
      date,
      data: players.map(p => ({
        playerId: p.id,
        attendance: document.querySelector(`.attendance[data-id="${p.id}"]`).value,
        rating: document.querySelector(`.rating[data-id="${p.id}"]`).value
      }))
    };

    const db = loadRecords();
    db.push(record);
    saveRecords(db);

    alert("Záznam uložen ✔");
  };

  renderPlayers();
});
