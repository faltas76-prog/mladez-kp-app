function generateTraining() {
  const goal = document.getElementById("goal").value;
  const length = parseInt(document.getElementById("length").value);

  // vyber cvičení podle cíle
  const filtered = drills.filter(d => d.goal === goal);

  if (filtered.length === 0) {
    alert("Žádná cvičení pro zvolený cíl.");
    return;
  }

  let plan = [];
  let time = 0;

  // postupné skládání tréninku
  filtered.forEach(d => {
    if (time + d.duration <= length) {
      plan.push(d);
      time += d.duration;
    }
  });

  if (plan.length === 0) {
    alert("Trénink nelze sestavit.");
    return;
  }

  // ULOŽENÍ PLÁNU
  localStorage.setItem("trainingPlan", JSON.stringify(plan));

  // přechod na trénink
  window.location.href = "training.html";
}
