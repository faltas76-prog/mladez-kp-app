const cat = localStorage.getItem("activeCategory");
const data = getCategory(cat);
const list = document.getElementById("list");

data.players.forEach(p => {
  list.innerHTML += `
    <div class="card">
      <label>
        <input type="checkbox" data-id="${p.id}"> ${p.name}
      </label>
    </div>`;
});
const PLAYER_KEY = "players";
const ATTENDANCE_KEY = "attendance";

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
document.getElementById("addPlayerBtn").onclick = () => {
  const input = document.getElementById("playerName");
  const name = input.value.trim();

  if (!name) {
    alert("Zadej jméno hráče");
    return;
  }

  const players = loadPlayers();

  players.push({
    id: Date.now(),
    name
  });

  savePlayers(players);
  input.value = "";
  renderPlayers();
  renderAttendance();
};
function renderPlayers() {
  const list = document.getElementById("playerList");
  const players = loadPlayers();

  list.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.name;
    list.appendChild(li);
  });
}
function renderAttendance() {
  const container = document.getElementById("attendanceList");
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
document.getElementById("saveAttendanceBtn").onclick = () => {
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

function save() {
  const records = [];
  document.querySelectorAll("input").forEach(i => {
    records.push({ playerId: i.dataset.id, present: i.checked });
  });
  data.attendance.push({ date: date.value, records });
  saveCategory(cat, data);
  alert("Uloženo");
}
renderPlayers();
renderAttendance();
