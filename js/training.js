const plan = JSON.parse(localStorage.getItem("trainingPlan"));

if (!plan || plan.length === 0) {
  alert("Tréninkový plán nebyl nalezen.");
}

let index = 0;
let timeLeft = 0;
let timer;

function start() {
  const d = plan[index];

  document.getElementById("name").innerText = d.name;
  document.getElementById("desc").innerHTML = `
    ${d.description}<br>
    <a href="${d.link}" target="_blank">▶ Ukázka cvičení</a>
  `;

  timeLeft = d.duration * 60;
  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText =
      Math.floor(timeLeft / 60) + ":" + String(timeLeft % 60).padStart(2, "0");

    if (timeLeft <= 0) next();
  }, 1000);
}

function next() {
  index++;
  if (index < plan.length) start();
  else {
    clearInterval(timer);
    alert("Trénink dokončen 💪");
  }
}

start();
