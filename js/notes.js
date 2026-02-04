const cat = localStorage.getItem("activeCategory");
const data = getCategory(cat);
const list = document.getElementById("list");

function loadPlayers() {
  player.innerHTML = `<option value="">Tým</option>`;
  data.players.forEach(p => {
    player.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });
}

function saveNote() {
  data.notes.push({
    date: date.value,
    playerId: player.value,
    rating: rating.value,
    text: text.value
  });
  saveCategory(cat, data);
  location.reload();
}

function exportPDF() { window.print(); }

loadPlayers();
