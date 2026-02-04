const cat = localStorage.getItem("activeCategory");
const data = getCategory(cat);
const list = document.getElementById("list");

function render() {
  list.innerHTML = "";
  data.players.forEach(p => {
    list.innerHTML += `<div class="card">${p.name}</div>`;
  });
}

function addPlayer() {
  if (data.players.length >= 30) return alert("Max 30 hráčů");
  data.players.push({ id: Date.now(), name: name.value });
  saveCategory(cat, data);
  name.value = "";
  render();
}

render();
