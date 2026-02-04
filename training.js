let plan = JSON.parse(localStorage.getItem('plan')) || [];
let index = 0;
let timeLeft = 0;
let interval;

function startDrill() {
  const d = plan[index];
  document.getElementById("drillName").innerText = d.name;
  document.getElementById("drillDesc").innerText = d.description;

  timeLeft = d.duration * 60;
  clearInterval(interval);

  interval = setInterval(() => {
    timeLeft--;
    renderTime();
    if (timeLeft <= 0) nextDrill();
  }, 1000);
}

function renderTime() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  document.getElementById("timer").innerText =
    `${min}:${sec.toString().padStart(2,"0")}`;
}

function nextDrill() {
  index++;
  if (index < plan.length) {
    startDrill();
  } else {
    alert("Trénink dokončen 💪");
    clearInterval(interval);
  }
}

startDrill();
