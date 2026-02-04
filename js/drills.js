const KEY = "customDrills";
const list = document.getElementById("list");

function loadDrills() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

function saveDrills(drills) {
  localStorage.setItem(KEY, JSON.stringify(drills));
}

function addDrill() {
  const drill = {
    id: Date.now(),
    name: name.value,
    goals: [goal.value],
    duration: parseInt(duration.value),
    description: description.value,
    link: link.value
  };

  if (!drill.name || !drill.duration) {
    alert("Vyplň název a délku.");
    return;
  }

  const drills = loadDrills();
  drills.push(drill);
  saveDrills(drills);

  name.value = "";
  description.value = "";
  link.value = "";

  render();
}

function render() {
  const drills = loadDrills();
  list.innerHTML = "";

  drills.forEach(d => {
    list.innerHTML += `
      <div class="card">
        <strong>${d.name}</strong><br>
        🎯 ${d.goals.join(", ")} | ⏱ ${d.duration} min
      </div>
    `;
  });
}

render();
