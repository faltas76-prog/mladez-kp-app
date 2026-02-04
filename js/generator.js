function generateTraining() {
  const goal = document.getElementById("goal").value;
  const length = parseInt(document.getElementById("length").value);

  const drills = getAllDrills();

  if (!drills || drills.length === 0) {
    alert("Databáze cvičení je prázdná.");
    return;
  }

  let plan = [];
  let time = 0;

  function addByGoal(g, limit = 2) {
    drills
      .filter(d => d.goals.includes(g))
      .forEach(d => {
        if (time + d.duration <= length && limit > 0) {
          plan.push(d);
          time += d.duration;
          limit--;
        }
      });
  }

  if (goal === "kombinace") {
    addByGoal("technika", 1);
    addByGoal("rychlost", 1);
    addByGoal("síla", 1);
    addByGoal("hra", 1);
  } else {
    addByGoal(goal, 10);
  }

  if (plan.length === 0) {
    alert("Nepodařilo se sestavit trénink.");
    return;
  }

  localStorage.setItem("trainingPlan", JSON.stringify(plan));
  window.location.href = "training.html";
}

