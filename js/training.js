const plan = JSON.parse(localStorage.getItem("trainingPlan")) || [];
let index = 0;
let timeLeft = 0;
let timer;

if (plan.length === 0) {
  alert("Nebyl nalezen žádný tréninkový plán.");
}

function startDrill() {
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
    renderTime();
    if (timeLeft <= 0) next();
  }, 1000);
}

function renderTime() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  document.getElementById("timer").innerText =
    `${min}:${sec.toString().padStart(2, "0")}`;
}

function next() {
  index++;
  if (index < plan.length) {
    startDrill();
  } else {
    clearInterval(timer);
    alert("Trénink dokončen 💪");
  }
}

startDrill();
