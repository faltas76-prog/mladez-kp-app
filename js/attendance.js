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

function save() {
  const records = [];
  document.querySelectorAll("input").forEach(i => {
    records.push({ playerId: i.dataset.id, present: i.checked });
  });
  data.attendance.push({ date: date.value, records });
  saveCategory(cat, data);
  alert("Uloženo");
}
