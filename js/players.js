console.log("players.js loaded");

const PLAYER_KEY = "players_v1";

function loadPlayers() {
  return JSON.parse(localStorage.getItem(PLAYER_KEY)) || [];
}

function savePlayers(players) {
  localStorage.setItem(PLAYER_KEY, JSON.stringify(players));
}

function renderPlayers() {
  const list = document.getElementById("playerList");
  const players = loadPlayers();

  list.innerHTML = "";

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
    };

    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("playerName");
  const btn = document.getElementById("addPlayerBtn");

  btn.onclick = () => {
    const name = input.value.trim();
    if (!name) {
      alert("Zadej jméno hráče");
      return;
    }

    const players = loadPlayers();
    players.push({ id: Date.now().toString(), name });
    savePlayers(players);

    input.value = "";
    renderPlayers();
  };

  renderPlayers();
});
