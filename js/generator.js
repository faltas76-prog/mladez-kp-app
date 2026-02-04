function generateTraining() {
  if (!window.drills || window.drills.length === 0) {
    alert("Cviky nejsou načteny. Zkontroluj data.js");
    return;
  }

  const goal = document.getElementById("goal").value;
  const length = parseInt(document.getElementById("length").value);

  let plan = [];
  let time = 0;

  // pomocná funkce
  function addDrills(goalName, limit = 1) {
    const found = window.drills.filter(d => d.goals.includes(goalName));
    for (let d of found) {
      if (time + d.duration <= length && limit > 0) {
        plan.push(d);
        time += d.duration;
        limit--;
      }
    }
  }

  // 🔥 KOMBINOVANÝ TRÉNINK
  if (goal === "kombinace") {
    addDrills("technika", 1);
    addDrills("rychlost", 1);
    addDrills("síla", 1);
    addDrills("hra", 1);
  } else {
    addDrills(goal, 10);
  }

  if (plan.length === 0) {
    alert("Nepodařilo se sestavit trénink – chybí cviky.");
    return;
  }

  localStorage.setItem("trainingPlan", JSON.stringify(plan));
  window.location.href = "training.html";
}
